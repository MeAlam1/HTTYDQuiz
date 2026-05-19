import {createRoot} from "react-dom/client";
import App from "./App";
import "./style/styles.css";

/* TODO:
* Add Optional TNR (Nine Realms) filter
* Add optional Rescue Riders filter
* Add Cloudflare database for LeaderBoard
 */

document.body.classList.add("js-enabled");
createRoot(document.getElementById("root")).render(<App/>);