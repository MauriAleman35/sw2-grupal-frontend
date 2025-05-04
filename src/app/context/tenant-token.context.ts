// tenant-token.context.ts
import { HttpContextToken } from '@angular/common/http';

export const USE_TENANT_TOKEN = new HttpContextToken<boolean>(() => false);
