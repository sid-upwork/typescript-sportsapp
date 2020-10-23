import { store } from '../index';
import { isReleaseBundleID } from './bundleId';
import { TRoles } from '../types/user';

export function hasAdminAccess (allowInRelease: boolean = false): boolean {
    const userRole: TRoles = store?.getState && store?.getState().userProfile?.role;
    if (!userRole) {
        return false;
    }
    const adminAccess = ['partner', 'influencer', 'admin'].indexOf(userRole) !== -1;
    if (isReleaseBundleID()) {
        return allowInRelease ? adminAccess : false;
    }
    return adminAccess;
}
