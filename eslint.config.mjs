import antfu from '@antfu/eslint-config'

export default antfu({
  stylistic: true,
  vue: {
    overrides: {
      'vue/block-order': [
        'error',
        {
          order: ['template', 'script', 'style'],
        },
      ],
    },
  },
  typescript: {
    overrides: {
      'ts/consistent-type-definitions': ['off'],
    },
  },
  rules: {
    'no-alert': 'off',
  },
})
