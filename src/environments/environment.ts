const apiBaseUrl = 'https://patient-raven-poetic.ngrok-free.app';

export const environment = {
    production: false,
    apiBaseUrl: apiBaseUrl,
    apiDepartmentsUrl: `${apiBaseUrl}/departments`,
    apiRegisterUrl: `${apiBaseUrl}/account/register`,
    apiGetAllProjectsByAccountId: `${apiBaseUrl}/project`,
};
