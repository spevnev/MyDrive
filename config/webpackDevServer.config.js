const noopServiceWorkerMiddleware = require("react-dev-utils/noopServiceWorkerMiddleware");
const evalSourceMapMiddleware = require("react-dev-utils/evalSourceMapMiddleware");
const redirectServedPath = require("react-dev-utils/redirectServedPathMiddleware");
const ignoredFiles = require("react-dev-utils/ignoredFiles");
const getHttpsConfig = require("./getHttpsConfig");
const paths = require("./paths");
const fs = require("fs");

const host = process.env.HOST || "0.0.0.0";
const sockHost = process.env.WDS_SOCKET_HOST;
const sockPath = process.env.WDS_SOCKET_PATH;
const sockPort = process.env.WDS_SOCKET_PORT;

module.exports = function (proxy, allowedHost) {
    const disableFirewall = !proxy || process.env.DANGEROUSLY_DISABLE_HOST_CHECK === "true";

    return {
        allowedHosts: disableFirewall ? "all" : [allowedHost],
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*",
        },
        compress: true,
        static: {
            directory: paths.appPublic,
            publicPath: [paths.publicUrlOrPath],
            watch: {
                ignored: ignoredFiles(paths.appSrc),
            },
        },
        client: {
            webSocketURL: {
                hostname: sockHost,
                pathname: sockPath,
                port: sockPort,
            },
            overlay: {
                errors: true,
                warnings: false,
            },
        },
        devMiddleware: {
            publicPath: paths.publicUrlOrPath.slice(0, -1),
        },
        server: getHttpsConfig()
            ? {
                  type: "https",
                  options: getHttpsConfig(),
              }
            : "http",
        host,
        historyApiFallback: {
            disableDotRule: true,
            index: paths.publicUrlOrPath,
        },
        proxy,
        setupMiddlewares: (middlewares, devServer) => {
            if (!devServer) {
                throw new Error("webpack-dev-server is not defined");
            }

            // Before middlewares (run early)
            if (fs.existsSync(paths.proxySetup)) {
                require(paths.proxySetup)(devServer.app);
            }
            devServer.app.use(evalSourceMapMiddleware(devServer));

            // After middlewares (run late)
            middlewares.push({
                name: "redirect-served-path",
                middleware: redirectServedPath(paths.publicUrlOrPath),
            });
            middlewares.push({
                name: "noop-service-worker",
                middleware: noopServiceWorkerMiddleware(paths.publicUrlOrPath),
            });

            return middlewares;
        },
    };
};
