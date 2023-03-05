const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin"); 
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

const isDev = process.env.NODE_ENV === 'development';
const isProd = !isDev;

const filename = (ext) => isDev ? `[name].${ext}` : `[name].[contenthash].${ext}`;

const optimization = () => {
  const configObj = {
    splitChunks: {
      chunks: 'all'
    }
  };

  if (isProd) {
    configObj.minimizer = [
      new CssMinimizerPlugin(),
      new TerserPlugin()
    ];
  }
  return configObj;
};

module.exports = {
  context: path.resolve(__dirname, 'source'),
  entry:  path.resolve(__dirname, 'source/js/main.js'),
  mode: 'development',
  devtool: isDev ? 'source-map' : undefined,
  output: {
    filename: `./js/${filename('js')}`,
    path: path.resolve(__dirname, 'dist'),
    assetModuleFilename: isDev ? `img/[name][ext]` : `img/[name].[contenthash][ext]`,
    clean: true
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    hot: true
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Development',
      template: path.resolve(__dirname, 'source/index.html'),
      filename: 'index.html',
      minify: {
        collapseWhitespace: isProd
      }
    }),
    new MiniCssExtractPlugin({
      filename: `./css/${filename('css')}`,
    }),
    // new CopyWebpackPlugin({
    //   patterns: [
    //     {from: path.resolve(__dirname, 'source/fonts'), to: path.resolve(__dirname, 'dist/fonts')}
    //   ]
    // })
  ],
  optimization: optimization(),
  module: {
    rules: [
    {
      test: /\.(html)$/,
      use: ['html-loader'],
    },
    {
      test: /\.(png|svg|jpe?g|gif|webp)$/i,
      type: 'asset/resource',
      use: isDev
          ? []
          : [
              {
                loader: 'image-webpack-loader',
                options: {
                  mozjpeg: {
                    progressive: true,
                  },
                  optipng: {
                    enabled: false,
                  },
                  pngquant: {
                    quality: [0.65, 0.9],
                    speed: 4,
                  },
                  gifsicle: {
                    interlaced: false,
                  },
                  webp: {
                    quality: 75,
                  },
                },
              },
            ],
    },
    {
      test: /\.(woff|woff2|eot|ttf|otf)$/,
      type: 'asset/resource',
      generator : {
          filename : 'fonts/[name][ext]'
      }
    },
    {
      test: /\.js$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env'],
        },
      },
    },
    {
      test: /\.css$/i,
      use: [
        {
          loader: MiniCssExtractPlugin.loader,
          options: {
            hmr: isDev
          },
        },
        "css-loader",
        "postcss-loader"
      ],
    }, 
    {
      test: /\.s[ac]ss$/i,
      use: [
        {
          loader: MiniCssExtractPlugin.loader,
          options: {
            publicPath: (resourcePath, context) => {
              return path.relative(path.dirname(resourcePath), context) + '/';
            },
          },
        },
        "css-loader",
        "postcss-loader",
        "sass-loader"
      ]
    }]
  }
};