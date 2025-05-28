// jest.config.ts
import type { Config } from 'jest';

const config: Config = {
  verbose: true,
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: 'coverage', // Ahora será relativo a la raíz del proyecto
  coverageProvider: 'v8',
  testResultsProcessor: 'jest-sonar-reporter',
  coverageReporters: ['text', 'html', 'clover', 'lcov'],

  // Configuración específica para NestJS
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.', // Raíz del proyecto
  roots: ['<rootDir>/src'], // Buscar archivos de prueba en src
  testRegex: '.*\\.spec\\.ts$',

  // Transformación para archivos TypeScript
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },

  // Exclusiones para reportes de cobertura
  collectCoverageFrom: [
    'src/**/*.(t|j)s',
    '!**/node_modules/**',
    // Excluir archivos de módulo y configuración
    '!**/*.module.ts',
    '!**/main.ts',
    // Excluir archivos de definición
    '!**/*.dto.ts',
    '!**/*.entity.ts',
    '!**/*.interface.ts',
    '!**/*.schema.ts',
    '!**/*.enum.ts',
    // Excluir archivos de configuración
    '!**/config/**',
  ],

  // Mapeo de módulos para importaciones más limpias
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
  },

  // Opcional: Establece umbrales de cobertura
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },

  // Extensiones de archivos que Jest debe considerar
  moduleFileExtensions: ['js', 'json', 'ts'],
};

export default config;
