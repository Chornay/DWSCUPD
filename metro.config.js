//changes made to allow build including source from DWCommon as DWcmn/
/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

 const path = require('path');const extraNodeModules = {
  'DWcmn': path.resolve(__dirname + '/../DWCommon'),
};
const watchFolders = [
  path.resolve(__dirname + '/../DWCommon')
];module.exports = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
  }, 
  resolver: {
    extraNodeModules: new Proxy(extraNodeModules, {
      get: (target, name) =>
        //redirects dependencies referenced from common/ to local node_modules
        name in target ? target[name] : path.join(process.cwd(), `node_modules/${name}`),
    }),
  },
  watchFolders,
};

//original
// /**
//  * Metro configuration for React Native
//  * https://github.com/facebook/react-native
//  *
//  * @format
//  */

// module.exports = {
//   transformer: {
//     getTransformOptions: async () => ({
//       transform: {
//         experimentalImportSupport: false,
//         inlineRequires: false,
//       },
//     }),
//   },
// };