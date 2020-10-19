const upstreamTransformer = require('metro-react-native-babel-transformer');
const sassTransformer = require('react-native-sass-transformer');
const svgTransformer = require('react-native-svg-transformer');

module.exports.transform = function({ src, filename, options }) {
    if (filename.endsWith('.scss') || filename.endsWith('.sass')) {
        return sassTransformer.transform({ src,
            filename,
            options });
    } else if (filename.endsWith('.svg')) {
        return svgTransformer.transform({ src,
            filename,
            options });
    }

    return upstreamTransformer.transform({ src,
        filename,
        options });
};
