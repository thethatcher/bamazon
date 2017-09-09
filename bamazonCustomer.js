var mysql = require("mysql");
var inquire = require("inquirer");

var connection = mysql.createConnection({
	host: "localhost",
	port: 3306,
	user: 'root',
	password:'password',
	database: 'bamazon'
});

connection.connect(function (err){
	if (err){throw err;}
	console.log("connected as id " + connection.threadId);
	displayStock(buyPrompt);
});

function displayStock(callback){
	connection.query("SELECT * FROM products",function(err,response){
		if(err){console.log(err);}
		formatQuery(response);
		callback();
	});
}

function formatQuery(array){
	for (var i = 0; i < array.length; i++) {
		var str = ("item ID: " + array[i].item_id);
		while(str.length < 13){str += "-";}
		str += ("Name: " + array[i].product_name);
		while(str.length < 36){str += "-";}
		str += ("Price: $" + array[i].price);
		console.log(str);
	}
}

function buyPrompt(){
	inquire.prompt([
		{
			name:"product"
			,type: "input"
			,message: "What product ID would you like to buy?"
			,validate: function(str){
				return parseInt(str) >= 0 && parseInt(str) < 14;
			}
		}
		,{
			name: "quantity"
			,type: "input"
			,message: "How many would you like to buy?"
			,validate: function(str){
				return parseInt(str) > 0;
			}
		}
		]).then(function(answers){
			connection.query("SELECT stock_quantity, price, product_name FROM products WHERE item_id = ?",[answers.product],function(err,response){
				if (response[0].stock_quantity < answers.quantity) {
					console.log("Insufficient quantity!");
					buyPrompt();
				}
				else{
					connection.query("UPDATE products SET stock_quantity = stock_quantity - ? WHERE item_id = ?",[answers.quantity,answers.product],function(err,update){
						if (err) {console.log(err);}
						console.log("Your purchase of " + answers.quantity + " " + response[0].product_name + " comes to $" + (parseInt(answers.quantity) * parseInt(response[0].price)) + " total.");
						buyPrompt();
					});
				}
			});
		});
}