// deno-fmt-ignore-file
// biome-ignore format: generated types do not need formatting
// prettier-ignore
import type { PathsForPages, GetConfigResponse } from 'waku/router';

// prettier-ignore
import type { getConfig as CatchAll_getConfig } from './pages/[...catchAll]';
// prettier-ignore
import type { getConfig as Add_getConfig } from './pages/add';
// prettier-ignore
import type { getConfig as EditorSlug_getConfig } from './pages/editor/[slug]';
// prettier-ignore
import type { getConfig as Index_getConfig } from './pages/index';
// prettier-ignore
import type { getConfig as Login_getConfig } from './pages/login';
// prettier-ignore
import type { getConfig as Logout_getConfig } from './pages/logout';
// prettier-ignore
import type { getConfig as PagePageNum_getConfig } from './pages/page/[pageNum]';

// prettier-ignore
type Page =
| ({ path: '/[...catchAll]' } & GetConfigResponse<typeof CatchAll_getConfig>)
| ({ path: '/add' } & GetConfigResponse<typeof Add_getConfig>)
| ({ path: '/editor/[slug]' } & GetConfigResponse<typeof EditorSlug_getConfig>)
| ({ path: '/' } & GetConfigResponse<typeof Index_getConfig>)
| ({ path: '/login' } & GetConfigResponse<typeof Login_getConfig>)
| ({ path: '/logout' } & GetConfigResponse<typeof Logout_getConfig>)
| ({ path: '/page/[pageNum]' } & GetConfigResponse<typeof PagePageNum_getConfig>)
| { path: '/post/[slug]'; render: 'dynamic' }
| { path: '/random'; render: 'dynamic' };

// prettier-ignore
declare module 'waku/router' {
  interface RouteConfig {
    paths: PathsForPages<Page>;
  }
  interface CreatePagesConfig {
    pages: Page;
  }
}
  