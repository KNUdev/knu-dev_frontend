const apiBaseUrl = 'http://localhost:5001';

export const environment = {
    production: false,
    apiBaseUrl: apiBaseUrl,
    apiDepartmentsUrl: `${apiBaseUrl}/departments`,
    apiRegisterUrl: `${apiBaseUrl}/account/register`,
    apiGetAccountUrl: `${apiBaseUrl}/account`,
    apiGetAllProjectsByAccountId: `${apiBaseUrl}/project`,
    apiRemoveAvatarUrl: `${apiBaseUrl}/account/avatar/remove`,
    apiRemoveBannerUrl: `${apiBaseUrl}/account/banner/remove`,
    apiUpdateBannerUrl: `${apiBaseUrl}/account/banner/update`,
    apiUpdateAvatarUrl: `${apiBaseUrl}/account/avatar/update`,
};
