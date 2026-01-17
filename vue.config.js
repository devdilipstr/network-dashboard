// module.exports = defineConfig({
//   transpileDependencies: true
// })
module.exports = {
  configureWebpack: {
  resolve: {
    fallback: {
        path: require.resolve('path-browserify'), // Use the polyfill
        fs: false 
    }
  },
  module: {
    rules: [
      {
        test: /\.js$|jsx/, // Match modern JavaScript files
        exclude: /node_modules\/(?!mongodb)/, // Include MongoDB library
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"], // Transpile modern syntax
          },
        },
      },
    ],
  },
    
},
  pluginOptions: {
    publicPath: './',
    electronBuilder: {
      builderOptions: {
        appId: "com.devd.networkdashboard",
        productName: "Network Dashboard",
        publish: [
          {
            provider: "github",
            owner:"devdilipstr",
            repo:"network-dashboard"
          }
        ],
        directories: {
          output: "dist_electron"
        },
        win: {
          target: ["nsis"],
          icon:"public/logo.ico"
        },
        linux: {
          target: "deb", // Specify Debian package format
          category: "Utility", // Choose the Linux category
          icon: "public/logo.png", // Path to your app's icon
          maintainer: "Dilip Suthar techartistdilip@gmail.com" 
        },
        files: [
          "**/*", // Include all files
          "!node_modules/**/*" ,// Exclude unnecessary files
          "dist/**/*" 
        ],
        extraResources: [
          {
            from: "dist",
            to: "dist",
            filter: ["**/*"]
          }
        ]
      }
    }
  }
}
