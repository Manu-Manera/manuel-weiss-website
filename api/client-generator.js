#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Client Generator for AI Investment System API
class APIClientGenerator {
  constructor() {
    this.openApiSpec = './openapi.yaml';
    this.outputDir = './generated';
    this.languages = ['typescript', 'python', 'javascript', 'java', 'csharp'];
  }

  async generateClients() {
    console.log('🚀 Starting API Client Generation...');
    
    try {
      // Create output directory
      if (!fs.existsSync(this.outputDir)) {
        fs.mkdirSync(this.outputDir, { recursive: true });
      }

      // Generate clients for each language
      for (const language of this.languages) {
        await this.generateClient(language);
      }

      // Generate documentation
      await this.generateDocumentation();

      // Generate Postman collection
      await this.generatePostmanCollection();

      console.log('✅ API Client Generation completed successfully!');
    } catch (error) {
      console.error('❌ Client generation failed:', error.message);
      process.exit(1);
    }
  }

  async generateClient(language) {
    console.log(`📦 Generating ${language} client...`);
    
    try {
      const outputPath = path.join(this.outputDir, language);
      
      // Generate client using OpenAPI Generator
      const command = `npx @openapitools/openapi-generator-cli generate \
        -i ${this.openApiSpec} \
        -g ${this.getGeneratorName(language)} \
        -o ${outputPath} \
        --additional-properties=${this.getAdditionalProperties(language)}`;
      
      execSync(command, { stdio: 'inherit' });
      
      // Post-process generated files
      await this.postProcessClient(language, outputPath);
      
      console.log(`✅ ${language} client generated successfully!`);
    } catch (error) {
      console.error(`❌ Failed to generate ${language} client:`, error.message);
    }
  }

  getGeneratorName(language) {
    const generators = {
      typescript: 'typescript-axios',
      python: 'python',
      javascript: 'javascript',
      java: 'java',
      csharp: 'csharp'
    };
    return generators[language];
  }

  getAdditionalProperties(language) {
    const properties = {
      typescript: 'npmName=ai-investment-client,packageName=ai-investment-client',
      python: 'packageName=ai_investment_client,packageVersion=1.0.0',
      javascript: 'npmName=ai-investment-client,packageVersion=1.0.0',
      java: 'groupId=com.ai-investment,artifactId=ai-investment-client,packageName=com.aiinvestment.client',
      csharp: 'packageName=AIInvestment.Client,packageVersion=1.0.0'
    };
    return properties[language];
  }

  async postProcessClient(language, outputPath) {
    const postProcessors = {
      typescript: this.postProcessTypeScript,
      python: this.postProcessPython,
      javascript: this.postProcessJavaScript,
      java: this.postProcessJava,
      csharp: this.postProcessCSharp
    };

    const processor = postProcessors[language];
    if (processor) {
      await processor.call(this, outputPath);
    }
  }

  async postProcessTypeScript(outputPath) {
    // Add custom TypeScript configurations
    const tsConfig = {
      compilerOptions: {
        target: 'ES2020',
        module: 'commonjs',
        lib: ['ES2020'],
        outDir: './dist',
        rootDir: './src',
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true
      },
      include: ['src/**/*'],
      exclude: ['node_modules', 'dist']
    };

    fs.writeFileSync(
      path.join(outputPath, 'tsconfig.json'),
      JSON.stringify(tsConfig, null, 2)
    );

    // Add package.json scripts
    const packageJsonPath = path.join(outputPath, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      packageJson.scripts = {
        ...packageJson.scripts,
        build: 'tsc',
        test: 'jest',
        lint: 'eslint src --ext .ts',
        'lint:fix': 'eslint src --ext .ts --fix'
      };
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    }
  }

  async postProcessPython(outputPath) {
    // Add custom Python configurations
    const setupPyPath = path.join(outputPath, 'setup.py');
    if (fs.existsSync(setupPyPath)) {
      let setupPy = fs.readFileSync(setupPyPath, 'utf8');
      setupPy = setupPy.replace(
        'install_requires=[]',
        'install_requires=["requests>=2.25.1", "urllib3>=1.26.0"]'
      );
      fs.writeFileSync(setupPyPath, setupPy);
    }
  }

  async postProcessJavaScript(outputPath) {
    // Add custom JavaScript configurations
    const packageJsonPath = path.join(outputPath, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      packageJson.scripts = {
        ...packageJson.scripts,
        test: 'jest',
        lint: 'eslint src --ext .js',
        'lint:fix': 'eslint src --ext .js --fix'
      };
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    }
  }

  async postProcessJava(outputPath) {
    // Add custom Java configurations
    const pomPath = path.join(outputPath, 'pom.xml');
    if (fs.existsSync(pomPath)) {
      let pom = fs.readFileSync(pomPath, 'utf8');
      // Add custom dependencies
      const dependencies = `
        <dependency>
          <groupId>org.springframework</groupId>
          <artifactId>spring-web</artifactId>
          <version>5.3.0</version>
        </dependency>
        <dependency>
          <groupId>com.fasterxml.jackson.core</groupId>
          <artifactId>jackson-databind</artifactId>
          <version>2.12.0</version>
        </dependency>`;
      
      pom = pom.replace('</dependencies>', `${dependencies}\n    </dependencies>`);
      fs.writeFileSync(pomPath, pom);
    }
  }

  async postProcessCSharp(outputPath) {
    // Add custom C# configurations
    const csprojPath = path.join(outputPath, 'AIInvestment.Client.csproj');
    if (fs.existsSync(csprojPath)) {
      let csproj = fs.readFileSync(csprojPath, 'utf8');
      // Add custom package references
      const packages = `
    <PackageReference Include="Newtonsoft.Json" Version="13.0.1" />
    <PackageReference Include="RestSharp" Version="106.11.7" />`;
      
      csproj = csproj.replace('</Project>', `${packages}\n  </Project>`);
      fs.writeFileSync(csprojPath, csproj);
    }
  }

  async generateDocumentation() {
    console.log('📚 Generating API documentation...');
    
    try {
      // Generate HTML documentation
      const command = `npx @openapitools/openapi-generator-cli generate \
        -i ${this.openApiSpec} \
        -g html2 \
        -o ${path.join(this.outputDir, 'docs')}`;
      
      execSync(command, { stdio: 'inherit' });
      
      console.log('✅ API documentation generated successfully!');
    } catch (error) {
      console.error('❌ Failed to generate documentation:', error.message);
    }
  }

  async generatePostmanCollection() {
    console.log('📮 Generating Postman collection...');
    
    try {
      const command = `npx @openapitools/openapi-generator-cli generate \
        -i ${this.openApiSpec} \
        -g postman \
        -o ${path.join(this.outputDir, 'postman')}`;
      
      execSync(command, { stdio: 'inherit' });
      
      console.log('✅ Postman collection generated successfully!');
    } catch (error) {
      console.error('❌ Failed to generate Postman collection:', error.message);
    }
  }
}

// Main execution
if (require.main === module) {
  const generator = new APIClientGenerator();
  generator.generateClients().catch(console.error);
}

module.exports = APIClientGenerator;
