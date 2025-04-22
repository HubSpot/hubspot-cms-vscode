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

export class AppValidator {
  private diagnosticCollection =
    languages.createDiagnosticCollection('hubspot-app');
  private static instance: AppValidator;
  private ajv: AjvInstance;

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
      if (document.fileName.endsWith('app.json')) {
        this.validateAppFile(document.uri);
      }
    });

    workspace.findFiles('**/app.json', '**/node_modules/**').then(
      (uris) => {
        uris.forEach((uri) => {
          this.validateAppFile(uri);
        });
      },
      (error: Error) => {
        console.error('Error finding app.json files:', error);
      }
    );
  }

  private async validateAppFile(uri: Uri): Promise<void> {
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
      console.error('Error in validateAppFile:', error);
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

  private async validateAgainstSchema(
    filePath: string,
    projectVersion: string
  ): Promise<ValidationResult> {
    try {
      const appJson = JSON.parse(readFileSync(filePath, 'utf-8'));
      const response = await axios.get(
        `https://api.hubspotqa.com/project-schemas/${projectVersion}/app`
      );
      const schema = response.data;
      delete schema.$schema;

      const validate = this.ajv.compile(schema);
      const isValid = validate(appJson);

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
      console.error('Error validating app.json:', error);
      return {
        isValid: false,
        errors: [
          {
            message: 'Failed to validate app.json against schema',
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
