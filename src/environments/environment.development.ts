const apiBaseUrl = 'http://localhost:5001';

export const environment = {
    production: false,
    apiBaseUrl: apiBaseUrl,
    apiDepartmentsUrl: `${apiBaseUrl}/departments`,
    apiRegisterUrl: `${apiBaseUrl}/account/register`,
};
