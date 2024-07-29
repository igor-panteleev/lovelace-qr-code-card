export enum AuthenticationType {
    WEP = "WEP",
    WPA = "WPA",
    NOPASS = "nopass",
}

const PasswordAuthenticationTypes = [AuthenticationType.WEP, AuthenticationType.WPA];

export function isPasswordProtected(auth_type: AuthenticationType | undefined): boolean {
    return auth_type !== undefined && PasswordAuthenticationTypes.includes(auth_type);
}
