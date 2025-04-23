import {
  workspace,
  Uri,
  Diagnostic,
  DiagnosticSeverity,
  languages,
  Range,
} from 'vscode';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import axios from 'axios';
import Ajv, { ErrorObject, Ajv as AjvInstance } from 'ajv';
import addFormats from 'ajv-formats';
import { getConfig } from '@hubspot/local-dev-lib/config';

interface HsProjectConfig {
  platformVersion: string;
  name: string;
  srcDir: string;
}

interface ValidationResult {
  isValid: boolean;
  errors?: Array<{
    message: string;
    path: string;
  }>;
}

interface MetaFile {
  type: string;
  [key: string]: any;
}

export class AppValidator {
  private diagnosticCollection =
    languages.createDiagnosticCollection('hubspot-app');
  private static instance: AppValidator;
  private ajv: AjvInstance;
  private readonly PORTAL_ID = 'ENTER PORTAL ID HERE';

  private constructor() {
    this.ajv = new Ajv({
      strict: false,
      allErrors: true,
      validateSchema: false,
      allowUnionTypes: true,
    });
    addFormats(this.ajv);
    this.initialize();
  }

  public static initialize(): AppValidator {
    if (!AppValidator.instance) {
      AppValidator.instance = new AppValidator();
    }
    return AppValidator.instance;
  }

  private initialize() {
    workspace.onDidSaveTextDocument((document) => {
      if (document.fileName.endsWith('-hsmeta.json')) {
        this.validateMetaFile(document.uri);
      }
    });

    workspace.findFiles('**/*-hsmeta.json', '**/node_modules/**').then(
      (uris) => {
        uris.forEach((uri) => {
          this.validateMetaFile(uri);
        });
      },
      (error: Error) => {
        console.error('Error finding meta files:', error);
      }
    );
  }

  private async validateMetaFile(uri: Uri): Promise<void> {
    try {
      const filePath = uri.fsPath;
      const projectRoot = this.findProjectRoot(filePath);

      if (!projectRoot) {
        return;
      }

      const projectVersion = await this.getProjectVersion(projectRoot);
      if (!projectVersion) {
        return;
      }

      const validationResult = await this.validateAgainstSchema(
        filePath,
        projectVersion
      );
      this.updateDiagnostics(uri, validationResult);
    } catch (error) {
      console.error('Error in validateMetaFile:', error);
    }
  }

  private findProjectRoot(filePath: string): string | null {
    let currentDir = filePath;
    while (currentDir !== '/') {
      currentDir = join(currentDir, '..');
      const hsProjectPath = join(currentDir, 'hsproject.json');
      if (existsSync(hsProjectPath)) {
        return currentDir;
      }
    }
    return null;
  }

  private async getProjectVersion(projectRoot: string): Promise<string | null> {
    try {
      const hsProjectPath = join(projectRoot, 'hsproject.json');
      const config: HsProjectConfig = JSON.parse(
        readFileSync(hsProjectPath, 'utf-8')
      );
      return config.platformVersion;
    } catch (error) {
      console.error('Error reading hsproject.json:', error);
      return null;
    }
  }

  private getAccessToken() {
    try {
      const config = getConfig();
      // @ts-expect-error
      return config.portals[0].auth.tokenInfo.accessToken;
    } catch (error) {
      console.error('Error getting access token:', error);
      throw new Error('Failed to get HubSpot access token from config');
    }
  }

  private async validateAgainstSchema(
    filePath: string,
    projectVersion: string
  ): Promise<ValidationResult> {
    try {
      const metaFile: MetaFile = JSON.parse(readFileSync(filePath, 'utf-8'));

      // Only validate files with type "app" for the purposes of this POC
      if (metaFile.type !== 'app') {
        return { isValid: true };
      }

      const accessToken = this.getAccessToken();
      const response = await axios.get(
        `https://api.hubspot.com/project-components-external/project-schemas/v3/2025.2`,
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const schema = response.data.APPLICATION;
      delete schema.$schema;

      const validate = this.ajv.compile(schema);
      const isValid = validate(metaFile);

      if (!isValid) {
        return {
          isValid: false,
          errors: validate.errors?.map((error: ErrorObject) => ({
            message: error.message || 'Unknown error',
            path: error.schemaPath || '',
          })),
        };
      }

      return { isValid: true };
    } catch (error) {
      console.error('Error validating meta file:', error);
      if (axios.isAxiosError(error)) {
        console.error('API Error:', error.response?.data);
      }
      return {
        isValid: false,
        errors: [
          {
            message: 'Failed to validate meta file against schema',
            path: '',
          },
        ],
      };
    }
  }

  private updateDiagnostics(uri: Uri, result: ValidationResult): void {
    if (result.isValid) {
      this.diagnosticCollection.delete(uri);
      return;
    }

    const diagnostics: Diagnostic[] = [];
    if (result.errors) {
      result.errors.forEach((error) => {
        const diagnostic = new Diagnostic(
          new Range(0, 0, 0, 0), // TODO: Get actual error location
          `${error.path}: ${error.message}`,
          DiagnosticSeverity.Error
        );
        diagnostics.push(diagnostic);
      });
    }

    this.diagnosticCollection.set(uri, diagnostics);
  }
}
