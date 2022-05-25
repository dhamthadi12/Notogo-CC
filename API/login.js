/**
 * New node file
 */


 var http_util = require('./http_util');

 /* Return login form page to client request.
 
    This function is exported so can be invoked out side current module. */
 exports.showLoginPage = function(req, resp){
    buildLoginPage(req, resp, '');
 }
 
 
 /* Verify user input login account data. Exported function also. */
 exports.checkLoginAccount = function(req, resp){
 
    // Use node query string module to parse login form post data.
    var query_string = require('querystring');
 
    // If client use post method to request.
     if (req.method == 'POST') {
 
        var req_body = '';
 
         req.on('data', function (data) {
             req_body += data;
 
             // If the POST data is too much then destroy the connection to avoid attack.
             // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
             if (req_body.length > 1e6)
                 req.connection.destroy();
         });
 
         req.on('end', function () {
 
            // Parse post data from request body, return a JSON string contains all post data.
             var post_data = query_string.parse(req_body);
 
             // Get user name from post data.
             var user_name = post_data["user_name"];
 
             // Get password from post data.
             var password = post_data["password"];
 
             // If user name and password is correct.
             if(user_name === 'jerry' && password === 'dev2qa.com')
             {
                 resp.writeHead(200, {'Content-Type':'text/html'});
 
                 // Assign page title.
                 var page_title = "Login success";
 
                 // Assign page navigation menu data.
                 var page_menu = http_util.pageMenu();
 
                 // Assign page content.
                 var page_content = "<font color=red>User name and password is correct, login success.</font>";
 
                 // Build login success page.
                 var login_success_page = http_util.buildPage(page_title, page_menu, page_content);
 
                 // Send login success page html source data to response.
                 resp.end(login_success_page);
             }else
             {
                // If user name and password is not correct.
                req.user_name = user_name;
                req.password = password;
 
                // Return login form page back to response.
             buildLoginPage(req, resp, 'User name or password is not correct.')
             }
         });
     }
 }
 
 
 /* This is a private function which can only be invoked in this module.
 *  This function is used to build login form page and return it to client.
 * */
 function buildLoginPage(req, resp, error_message) {
 
     http_util.getUrlParams(req, resp);
 
     var page_title = "Login Page";
 
     var page_menu = http_util.pageMenu();
 
     var login_form = "<h3>Input user name and password to login.</h3>";
 
     if(error_message!=='' && error_message!==null && error_message!==undefined)
    {
       login_form += "<font color=red>" + error_message + "</font><br/><br/>";
    }
 
    login_form += "<form method='post' action='/check-login'>" +
         "User Name : <input type='text' name='user_name' value='{user_name}'/><br/><br/>" +
         "Password :<input type='password' name='password' value='{password}'/><br/><br/>" +
         "<input type='submit' value='Login'/><br/><br/>" +
         "</form>";
 
     if(req.user_name==null || req.user_name==undefined)
     {
         req.user_name = '';
     }
 
     if(req.password==null || req.password==undefined)
     {
         req.password = '';
     }
 
     login_form = login_form.replace("{user_name}", req.user_name);
 
     login_form = login_form.replace("{password}", req.password);
 
     var login_page_data = http_util.buildPage(page_title, page_menu, login_form);
 
     resp.writeHead(200, {'Content-Type':'text/html'});
 
     resp.end(login_page_data);
 }