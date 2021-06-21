import slsHttp from 'serverless-http';
import binaryMimeTypes from '../utils/binaryMimeTypes';
import nuxtApp from '../web/nuxtApp';

export default slsHttp(nuxtApp, {
    binary: binaryMimeTypes,
});