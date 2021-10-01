const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const CleanCSSPlugin = require('clean-css');
const MomentLocalesPlugin = require('moment-locales-webpack-plugin');

const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  entry: './src/index.js',
  devtool: 'inline-source-map', // 소스 원본 표시
  devServer: { // local 개발 서버 옵션
    contentBase: path.resolve(__dirname, isProd ? 'dist' : 'test'),
    historyApiFallback: true, // html5 history api 사용 여부
    noInfo: true, // 번들 정보 메세지 표시 여부
    overlay: true, // 컴파일러 오류 시 브라우저 전체화면에 내용 표시 여부
    hot: true, // HotModuleReplacementPlugin 와 같이 재시작 없이 파일 교체 기능
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(), // 재시작 없이 교체 기능
    new CopyWebpackPlugin([{ from: 'static', to: 'static' }]), // copy
    new webpack.ProvidePlugin({ // 자동으로 모듈을 로드
      $: 'jquery',
      jQuery: 'jquery',
      _: 'lodash',
    }),
    new MomentLocalesPlugin({ // moment i18n
      localesToKeep: ['ko'],
    }),
  ],
  output: {
    filename: 'Html5Chart.js?[hash]', // 파일 명
    path: path.resolve(__dirname, 'dist'), // 파일 위치
    libraryTarget: 'this', // https://webpack.js.org/configuration/output/#outputlibrarytarget
  },
  module: {
    rules: [
      { // css 로더
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      { // less 로더
        test: /\.less$/,
        use: [
          {
            loader: 'less-loader',
            options: {
              paths: [path.resolve(__dirname, 'node_modules')],
              plugins: [new CleanCSSPlugin({ advanced: true })],
            },
          },
        ],
      },
      { // 이미지 로더
        test: /\.(png|jpg|gif|cur)$/,
        use: {
          loader: 'file-loader',
          options: {
            publicPath: 'static/Library/ChartLib/images/',
            outputPath: 'images/',
            name: '[name].[ext]?[hash]',
          }
        },
      },
      { // 파일 로더
        test: /\.(woff|woff2|ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'file-loader',
        options: {
          publicPath: 'static/Library/ChartLib/fonts/',
          outputPath: 'fonts/',
          name: '[name].[ext]?[hash]',
        }
      },
      { // js 로더
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            compact: isProd,
          },
        },
        exclude: /node_modules/,
      },
      { // html 로더
        test: /\.html$/,
        use: [
          {
            loader: 'html-loader',
            options: {
              minimize: isProd, // 압축 여부
              removeComments: false, // 주석 삭제 여부
              collapseWhitespace: false,
            },
          },
        ],
      },
    ],
  },
};

if (process.env.NODE_ENV === 'development') {
  module.exports.mode = 'development';
}

if (isProd) {
  module.exports.mode = 'development'; // TODO: 배포시 주석 처리 필요

  module.exports.optimization = {
    minimizer: [
      new UglifyJsPlugin({ // output 을 압축
        parallel: true, // 다중 프로세서
        uglifyOptions: {
          sourceMap: true, // 소스맵 여부 - TODO: 배포 시 주석 처리 필요
          warnings: false, // 경고 표시 안함
          compress: {
            drop_console: true, // console.log 삭제
          },
        },
        extractComments: true, // 주석을 별도의 파일로 추출할지 여부
      }),
    ],
  };
  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.DefinePlugin({ // 특정 문자를 치환하는 플러그인
      'process.env': {
        NODE_ENV: '"production"',
      },
    }),
  ]);
}
