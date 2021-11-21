import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap';
import 'flag-icon-css/css/flag-icons.min.css';

const $ = require("jquery")

export const onInitialClientRender = () => {
    $(document).ready(function () {
        console.log("The answer is don't think about it!")
    });
}