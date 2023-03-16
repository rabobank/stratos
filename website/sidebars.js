module.exports = {
  docs: {
    'Stratos': [
      'introduction',
      'overview',
      'license'
    ],
    'Deploy': [
      'deploy/overview',
      {
        "Cloud Foundry": [
          'deploy/cloud-foundry/cloud-foundry',
          'deploy/cloud-foundry/db-migration',
          'deploy/cloud-foundry/cf-troubleshooting'
        ],
      },
      'deploy/all-in-one',
      `deploy/tech-preview`,
      'deploy/access',
      'deploy/troubleshooting',
    ],
    'Endpoints': [
      'endpoints/introduction',
      {
        'Cloud Foundry': [
          'endpoints/cf/cf',
          'endpoints/cf/invite-user-guide'
        ]
      },
      'endpoints/k8s',
      {
        'Metrics': [
          'endpoints/metrics/metrics',
          'endpoints/metrics/bosh-metrics'
        ]
      },
      'endpoints/helm',
    ],
    'Advanced Topics': [
      'advanced/sso',
    ],
    'Develop': [
      'developer/contributing',
      'developer/introduction',
      {
        Frontend: [
          'developer/frontend',
          'developer/frontend-tests'
        ]
      },
      {
        Backend: [
          'developer/backend',
        ]
      },
      {
        Deploy: [
          'developer/deploy',
          'developer/developers-guide-helm'
        ]
      },
      'developer/developers-guide-kube-local-dev',
      'developer/developers-guide-e2e-tests',
      'developer/developers-guide-env-tech',
    ],
    'Extend': [
      'extensions/introduction',
      `extensions/disable-packages`,
      'extensions/v4-migration',
      'extensions/theming',
      'extensions/frontend',
      'extensions/backend',
    ],

  },
};
