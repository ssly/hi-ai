import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			// 为里文件打包在外面是因为 utools 插件的限制
			// 如果 utools 的 plugins 在的目录或外层有 packege.json
			// 并且指定了 type: module，那么 electron 会报错
			// electron 的 type 只支持 commonjs
			// 但 svelte 的 type 只支持 module
			// 所以只能打包在外面
			pages: '../plugins/renderer',
			assets: '../plugins/renderer',
			fallback: 'index.html',
			precompress: false,
		}),
	}
};

export default config;
