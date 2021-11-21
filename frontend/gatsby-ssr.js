const React = require("react")

export const onRenderBody = ({ setHeadComponents }, pluginOptions) => {
    setHeadComponents([
        <script
            src="https://code.jquery.com/jquery-3.6.0.min.js"
            integrity="sha256-/xUj+3OJU5yExlq6GSYGSHk7tPXikynS7ogEvDej/m4="
            crossOrigin="anonymous">
        </script>,
    ])
}