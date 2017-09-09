var mysql = require("mysql");
var inquire = require("inquirer");
var table = require("cli-table");

var connection = mysql.createConnection({
	host: "localhost",
	port: 3306,
	user: 'root',
	password:'password',
	database: 'bamazon'
});

connection.connect( (err) =>{
	if(err){console.log(err)}
	managerOptions();
});

function managerOptions(){
	inquire.prompt([
	{
		name: "selection"
		,type: "list"
		,message: "Welcome Manager. What would you like to do?"
		,choices: ["View Products for Sale","View Low Inventory","Add to Inventory","Add New Product"]
	}]).then((answer)=>{
		switch(answer.selection){
			case "View Products for Sale":
				showProduct();
				break;
			case "View Low Inventory":
				viewLow();
				break;
			case "Add to Inventory":
				restock();
				break;
			case "Add New Product":
				addItem();
				break;
			default :
				console.log("Invalid selection made.");
				managerOptions();
		}
	});
}

function showProduct(){
	connection.query("SELECT * FROM products", function(err,results){
		if(err){console.log(err);}
		formatQuery(results);
	});
}

function viewLow(){
	connection.query("SELECT * FROM products WHERE stock_quantity < 5", function(err,results){
		if(err){console.log(err);}
		formatQuery(results);
	});
}

function restock(){
	inquire.prompt([
	{
		name:"product"
		,type:"input"
		,message:"What is the product ID you want to restock?"
		,validate: function(str){
			return	parseInt(str) > 0;
		}
	},
	{
		name:"amount"
		,type:"input"
		,message:"How many items are you stocking?"
		,validate: function(str){
			return	parseInt(str) >= 0;
		}
	}
	]).then(function(answers){
		connection.query("SELECT COUNT(*) AS 'rows' FROM products", (err,response)=>{
			if (answers.product <= response[0].rows) {
				connection.query("UPDATE products SET stock_quantity = stock_quantity + ? WHERE item_id = ?",
					[answers.amount,answers.product], (err,result)=>{
						if(err){console.log(err);}
					})
			}
			else{
				console.log("Invalid product ID.");
				restock();
			}
			managerOptions();
		})
	});

}

function addItem(){ 
	inquire.prompt([
	{
		name:"name"
		,type: "input"
		,message: "What is the product name?"
	}
	,{
		name:"department"
		,type: "input"
		,message: "What department will sell this product?"
	}
	,{
		name: "price"
		,type: "input"
		,message: "How much will this item sell for?"
		,validate: function(str){
			return parseInt(str) > 0;
		}
	}
	,{
		name: "quantity"
		,type: "input"
		,message: "How many items will be stocked?"
		,validate: function(str){
			return parseInt(str) > 0;
		}
	}
	]).then(function(answers){
		connection.query("INSERT INTO products (product_name,department_name,price,stock_quantity)" + 
			"VALUES (?,?,?,?)", [answers.name,answers.department,answers.price,answers.quantity], function(err,result){
				if(err){console.log(err);}
				console.log("Item added");
				managerOptions();
			});
	});
}

function formatQuery(array){
	for (var i = 0; i < array.length; i++) {
		var str = ("item ID: " + array[i].item_id);
		while(str.length < 13){str += "-";}
		str += ("Name: " + array[i].product_name);
		while(str.length < 36){str += "-";}
		str += ("Price: $" + array[i].price);
		while(str.length < 55){str += "-";}
		str += ("Quantity: " + array[i].stock_quantity);
		console.log(str);
	}
	managerOptions();
}