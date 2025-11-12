// THIS IS STARTING POINT. WHEN YOUR WINDOWS WILL CREATED
//  Go..Go..Go..
import { MainDashboard } from "./src/MainDashboard.uc.js";

const frm = MainDashboard.Create({
  targetElement: document.body
});
frm.ucExtends.show();