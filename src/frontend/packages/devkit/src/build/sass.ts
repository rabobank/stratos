import * as fs from 'fs';
import * as path from 'path';
import { StratosConfig } from '../lib/stratos.config';

export class SassHandler {
  constructor() {}

  public apply(_, config: StratosConfig) {
    const extensionsFilePath = config.resolvePackage(
      config.getTheme().name,
      '_extensions.scss'
    );

    fs.writeFileSync(extensionsFilePath, this.getThemingForPackages(config));
  }

  // Generate an import and include for each themable package so that we theme
  // its components when the application is built.
  private getThemingForPackages(c: StratosConfig): string {
    let contents = '';
    const themedPackages = c.getThemedPackages();
    themedPackages.forEach(themingConfig => {
      contents += `@import '${themingConfig.importPath}';\n`;
    });

    contents += '\n@mixin apply-theme($stratos-theme) {\n';
    themedPackages.forEach(themingConfig => {
      contents += `  @include ${themingConfig.mixin}($stratos-theme);\n`;
    });
    contents += '}\n';

    return contents;
  }
}
