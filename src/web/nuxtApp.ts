import { Nuxt } from 'nuxt-start';
import config from '../../nuxt.config';

const nuxt = new Nuxt({ ...config, dev: false });

export default async function (req: any, res: any) {
    await nuxt.ready();
    nuxt.server.app(req, res);
}