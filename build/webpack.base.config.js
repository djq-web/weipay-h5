const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HappyPack = require('happypack');
const os = require('os');
const happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length });

module.exports = {
    entry: ["./src/index.js"],
    output: {
        // 输出目录
        path: path.resolve(__dirname, "../dist")
    },
    resolve: {
        extensions: [".js", ".jsx"], // 扩展
        alias: {
            '@': path.resolve(__dirname, 'src'),
            '@assets': path.resolve('src/assets'),
            '@pages': path.resolve('src/pages'),
            '@api': path.resolve('src/api'),
            '@utils': path.resolve('src/utils'),
            '@store': path.resolve('src/store'),
            '@components': path.resolve('src/components'),
        }
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx?)$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: "happypack/loader?id=happyBabel"
                    }
                ]
            },
            {
                test: /\.css|less$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            //  您可以在此处指定publicPath
                            //  默认情况下，它在webpackOptions.output中使用publicPath
                            publicPath: '../'
                        }
                    }, 'css-loader', 'postcss-loader', 'less-loader'
                ],
                // 这里会直接到 src 文件下找 less/css 文件进行编译，这里是项目优化的一个小技巧
                // include: path.resolve(__dirname, '../src')
            },
            {
                test: /\.(png|jpg|jpeg|gif|svg)/,
                use: {
                    loader: "url-loader",
                    options: {
                        outputPath: "images/", // 图片输出的路径
                        limit: 10 * 1024
                    }
                }
            },
            {
                test: /\.(eot|woff2?|ttf|svg)$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            name: '[name]-[hash:5].min.[ext]',
                            limit: 5000, // 使用base64进行转换， 大小限制小于5KB， 否则使用svg输出
                            publicPath: 'fonts/',
                            outputPath: 'fonts/'
                        }
                    }
                ]
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            title:'威缴费',  //  网站标题
            filename: "index.html", // 最终创建的文件名
            template: path.resolve(__dirname, '..', "src/index.html"), // 指定模板路径
            favicon: path.resolve('favicon.ico'), // 在此处设置页面ico
            minify: {
                removeComments: true, // 移除HTML中的注释
                collapseWhitespace: true, // 去除空白
                minifyCSS: true // 压缩内联css
            }
        }),
        // 单独生成css文件和js文件分离开来 加快页面渲染
        new MiniCssExtractPlugin({
            filename: "css/[name]_[hash:6].css?t=[hash:6]",
        }),
        // happypack
        new HappyPack({
            //用id来标识 happypack处理那里类文件
            id: 'happyBabel',
            //如何处理  用法和loader 的配置一样
            loaders: [{
                loader: 'babel-loader?cacheDirectory=true',
            }],
            //共享进程池threadPool: HappyThreadPool 代表共享进程池，即多个 HappyPack 实例都使用同一个共享进程池中的子进程去处理任务，以防止资源占用过多。
            threadPool: happyThreadPool,
            //允许 HappyPack 输出日志
            verbose: true,
        }),

    ],
    performance: false // 关闭性能提示
};
