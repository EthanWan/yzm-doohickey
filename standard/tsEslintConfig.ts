/*
 * Alibaba's TypeScript style guide
 * URL: https://github.com/alibaba/f2e-spec/blob/main/docs/coding/6.typescript-style-guide.md
 */

export default {
  '@typescript-eslint/adjacent-overload-signatures': 'error',
  '@typescript-eslint/array-type': ['warn', { default: 'array-simple' }],
  '@typescript-eslint/await-thenable': 'off',
  '@typescript-eslint/ban-ts-comment': [
    'warn',
    {
      'ts-expect-error': 'allow-with-description',
      'ts-ignore': 'allow-with-description',
      'ts-nocheck': 'allow-with-description',
      'ts-check': 'allow-with-description',
    },
  ],
  '@typescript-eslint/ban-tslint-comment': 'error',
  '@typescript-eslint/ban-types': 'off',
  'brace-style': 'off',
  '@typescript-eslint/brace-style': ['error', '1tbs', { allowSingleLine: true }],
  '@typescript-eslint/class-literal-property-style': ['warn', 'fields'],
  'comma-spacing': 'off',
  '@typescript-eslint/comma-spacing': ['error', { before: false, after: true }],
  '@typescript-eslint/consistent-type-assertions': [
    'error',
    {
      assertionStyle: 'as',
      objectLiteralTypeAssertions: 'never',
    },
  ],
  '@typescript-eslint/consistent-type-definitions': ['warn', 'interface'],
  'default-param-last': 'off',
  '@typescript-eslint/default-param-last': 'off',
  'dot-notation': 'off',
  '@typescript-eslint/dot-notation': ['error', { allowKeywords: true }],
  '@typescript-eslint/explicit-function-return-type': 'off',
  '@typescript-eslint/explicit-member-accessibility': [
    'warn',
    { accessibility: 'no-public' },
  ],
  '@typescript-eslint/explicit-module-boundary-types': 'off',
  'func-call-spacing': 'off',
  '@typescript-eslint/func-call-spacing': ['error', 'never'],
  indent: 'off',
  '@typescript-eslint/indent': [
    'error',
    2,
    {
      SwitchCase: 1,
      VariableDeclarator: 1,
      outerIIFEBody: 1,
      // MemberExpression: null,
      FunctionDeclaration: {
        parameters: 1,
        body: 1,
      },
      FunctionExpression: {
        parameters: 1,
        body: 1,
      },
      CallExpression: {
        arguments: 1,
      },
      ArrayExpression: 1,
      ObjectExpression: 1,
      ImportDeclaration: 1,
      flatTernaryExpressions: false,
      // list derived from https://github.com/benjamn/ast-types/blob/HEAD/def/jsx.js
      ignoredNodes: [
        'JSXElement',
        'JSXElement > *',
        'JSXAttribute',
        'JSXIdentifier',
        'JSXNamespacedName',
        'JSXMemberExpression',
        'JSXSpreadAttribute',
        'JSXExpressionContainer',
        'JSXOpeningElement',
        'JSXClosingElement',
        'JSXText',
        'JSXEmptyExpression',
        'JSXSpreadChild',
      ],
      ignoreComments: false,
    },
  ],
  'init-declarations': 'off',
  '@typescript-eslint/init-declarations': 'off',
  'keyword-spacing': 'off',
  '@typescript-eslint/keyword-spacing': [
    'error',
    {
      before: true,
      after: true,
      overrides: {
        return: { after: true },
        throw: { after: true },
        case: { after: true },
      },
    },
  ],
  'lines-between-class-members': 'off',
  '@typescript-eslint/lines-between-class-members': 'off',
  '@typescript-eslint/member-delimiter-style': 'error',
  '@typescript-eslint/member-ordering': [
    'warn',
    {
      default: [
        'public-static-field',
        'protected-static-field',
        'private-static-field',
        'static-field',
        'public-static-method',
        'protected-static-method',
        'private-static-method',
        'static-method',
        'public-instance-field',
        'protected-instance-field',
        'private-instance-field',
        'public-field',
        'protected-field',
        'private-field',
        'instance-field',
        'field',
        'constructor',
        'public-instance-method',
        'protected-instance-method',
        'private-instance-method',
        'public-method',
        'protected-method',
        'private-method',
        'instance-method',
        'method',
      ],
    },
  ],
  '@typescript-eslint/method-signature-style': ['warn', 'property'],
  camelcase: 'off',
  '@typescript-eslint/camelcase': 'off',
  '@typescript-eslint/naming-convention': 'off',
  'no-array-constructor': 'off',
  '@typescript-eslint/no-array-constructor': 'error',
  '@typescript-eslint/no-base-to-string': 'off',
  '@typescript-eslint/no-confusing-non-null-assertion': 'warn',
  'no-dupe-class-members': 'off',
  '@typescript-eslint/no-dupe-class-members': 'error',
  '@typescript-eslint/no-dynamic-delete': 'off',
  'no-empty-function': 'off',
  '@typescript-eslint/no-empty-function': [
    'error',
    {
      allow: ['arrowFunctions', 'functions', 'methods'],
    },
  ],
  '@typescript-eslint/no-empty-interface': 'warn',
  '@typescript-eslint/no-explicit-any': 'off',
  '@typescript-eslint/no-extra-non-null-assertion': 'off',
  'no-extra-parens': 'off',
  '@typescript-eslint/no-extra-parens': 'off',
  'no-extra-semi': 'off',
  '@typescript-eslint/no-extra-semi': 'error',
  '@typescript-eslint/no-extraneous-class': 'off',
  '@typescript-eslint/no-floating-promises': 'off',
  '@typescript-eslint/no-for-in-array': 'off',
  '@typescript-eslint/no-implied-eval': 'off',
  '@typescript-eslint/no-inferrable-types': 'warn',
  'no-invalid-this': 'off',
  '@typescript-eslint/no-invalid-this': 'off',
  '@typescript-eslint/no-invalid-void-type': 'error',
  'no-magic-numbers': 'off',
  '@typescript-eslint/no-magic-numbers': 'off',
  '@typescript-eslint/no-misused-new': 'off',
  '@typescript-eslint/no-misused-promises': 'off',
  '@typescript-eslint/no-namespace': [
    'error',
    {
      allowDeclarations: true,
      allowDefinitionFiles: true,
    },
  ],
  '@typescript-eslint/no-non-null-asserted-optional-chain': 'error',
  '@typescript-eslint/no-non-null-assertion': 'off',
  '@typescript-eslint/no-parameter-properties': 'off',
  '@typescript-eslint/no-require-imports': 'warn',
  'no-shadow': 'off',
  '@typescript-eslint/no-shadow': 'error',
  '@typescript-eslint/no-this-alias': [
    'warn',
    {
      allowDestructuring: true,
    },
  ],
  '@typescript-eslint/no-throw-literal': 'off',
  '@typescript-eslint/no-type-alias': 'off',
  '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'off',
  '@typescript-eslint/no-unnecessary-condition': 'off',
  '@typescript-eslint/no-unnecessary-qualifier': 'off',
  '@typescript-eslint/no-unnecessary-type-arguments': 'off',
  '@typescript-eslint/no-unnecessary-type-assertion': 'off',
  '@typescript-eslint/no-unsafe-assignment': 'off',
  '@typescript-eslint/no-unsafe-call': 'off',
  '@typescript-eslint/no-unsafe-member-access': 'off',
  '@typescript-eslint/no-unsafe-return': 'off',
  'no-unused-expressions': 'off',
  '@typescript-eslint/no-unused-expressions': [
    'error',
    {
      allowShortCircuit: true,
      allowTernary: true,
      allowTaggedTemplates: true,
    },
  ],
  'no-unused-vars': 'off',
  '@typescript-eslint/no-unused-vars': [
    'error',
    { vars: 'all', args: 'after-used', ignoreRestSiblings: true },
  ],
  '@typescript-eslint/no-unused-vars-experimental': 'off',
  'no-use-before-define': 'off',
  '@typescript-eslint/no-use-before-define': [
    'error',
    { functions: false, classes: false, variables: false },
  ],
  'no-useless-constructor': 'off',
  '@typescript-eslint/no-useless-constructor': 'error',
  '@typescript-eslint/no-var-requires': 'off',
  '@typescript-eslint/prefer-as-const': 'warn',
  '@typescript-eslint/prefer-for-of': 'off',
  '@typescript-eslint/prefer-function-type': 'off',
  '@typescript-eslint/prefer-includes': 'off',
  '@typescript-eslint/prefer-namespace-keyword': 'error',
  '@typescript-eslint/prefer-nullish-coalescing': 'off',
  '@typescript-eslint/prefer-optional-chain': 'off',
  '@typescript-eslint/prefer-readonly': 'off',
  '@typescript-eslint/prefer-readonly-parameter-types': 'off',
  '@typescript-eslint/prefer-reduce-type-parameter': 'off',
  '@typescript-eslint/prefer-regexp-exec': 'off',
  '@typescript-eslint/prefer-string-starts-ends-with': 'off',
  '@typescript-eslint/prefer-ts-expect-error': 'off',
  '@typescript-eslint/promise-function-async': 'off',
  quotes: 'off',
  '@typescript-eslint/quotes': ['error', 'single', { avoidEscape: true }],
  'require-await': 'off',
  '@typescript-eslint/require-await': 'off',
  '@typescript-eslint/restrict-plus-operands': 'warn',
  '@typescript-eslint/restrict-template-expressions': 'off',
  'no-return-await': 'off',
  '@typescript-eslint/return-await': 'off',
  semi: 'off',
  '@typescript-eslint/semi': ['error', 'always'],
  'space-before-function-paren': 'off',
  '@typescript-eslint/space-before-function-paren': [
    'error',
    {
      anonymous: 'always',
      named: 'never',
      asyncArrow: 'always',
    },
  ],
  '@typescript-eslint/strict-boolean-expressions': 'off',
  '@typescript-eslint/switch-exhaustiveness-check': 'off',
  '@typescript-eslint/triple-slash-reference': [
    'error',
    {
      path: 'never',
      types: 'always',
      lib: 'always',
    },
  ],
  '@typescript-eslint/type-annotation-spacing': 'error',
  '@typescript-eslint/typedef': [
    'error',
    {
      arrayDestructuring: false,
      arrowParameter: false,
      memberVariableDeclaration: false,
      objectDestructuring: false,
      parameter: false,
      propertyDeclaration: true,
      variableDeclaration: false,
    },
  ],
  '@typescript-eslint/unbound-method': 'off',
  '@typescript-eslint/unified-signatures': 'warn',
  'no-redeclare': 'off',
  '@typescript-eslint/no-redeclare': ['error'],
}
