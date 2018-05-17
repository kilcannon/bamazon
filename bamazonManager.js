var mysql = require("mysql")
var inquirer = require("inquirer")

var itemInput
var itemQuantity
var updatedQuantity
var itemOrdered
var orderCost
var currentStock
var addStock
var totalNewStock

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "Eerste00$$",
  database: "bamazon"
})

connection.connect(function(err) {
  if (err) throw err;
  managerView()
})

function managerView() {
	inquirer.prompt([
	{
		type: 'list',
		name: 'action',
		message: 'Hello!  What can I help you do today?',
		choices: ['View Inventory', 'View LOW Inventory', 'Restock Inventory', 'Add New Product'],
	}
	]).then(function(res) {
		if (res.action === "View Inventory") {
			listProducts()
		}
		else if (res.action === "View LOW Inventory") {
      lowInventory()
		}
		else if (res.action === "Restock Inventory") {
      restockInventory()
		}
		else if (res.action === "Add New Product") {
      createProduct()
		}
	})
}

function listProducts() {
  connection.query("SELECT * FROM products", function(err, res) {
    if (err) throw err;
    
    console.log("\n---------------------------------------------------------------------------------------------------------------")
    for (var i = 0; i < res.length; i++) {

      console.log("Item ID: " + res[i].item_id, " || Product: " + res[i].product_name, " || Price: $" + res[i].price, " || Inventory: " + res[i].stock_quantity, " || Department: " + res[i].department_name)
      console.log("---------------------------------------------------------------------------------------------------------------")
    }
    managerView()
  })
}

function lowInventory() {
  connection.query("SELECT * FROM products", function(err, res) {
    if (err) throw err;
    
    console.log("\nCurrent List of Low Invetory Items")
    console.log("---------------------------------------------------------------------------------------------------------------")
    for (var i = 0; i < res.length; i++) {
      if (res[i].stock_quantity <= 50) {

        console.log("Item ID: " + res[i].item_id, " || Product: " + res[i].product_name, " || Inventory: " + res[i].stock_quantity, " || Department: " + res[i].department_name)
        console.log("---------------------------------------------------------------------------------------------------------------")
      }
    }
    managerView()
  })
}

function restockInventory() {
  connection.query("SELECT * FROM products", function(err, res) {
    if (err) throw err;
    
    console.log("---------------------------------------------------------------------------------------")
    for (var i = 0; i < res.length; i++) {

      console.log("Item ID: " + res[i].item_id, " || Product: " + res[i].product_name, " || Inventory: " + res[i].stock_quantity)
      console.log("---------------------------------------------------------------------------------------")
    }
    inquirer.prompt([
      {
        type: "input",
        name: "item",
        message: "\nEnter the item ID of the product you would like to restock.\n"
      }
    ]).then(function(answer) {
      itemInput = answer.item
      inquirer.prompt([
        {
          type: "input",
          name: "quantity",
          message: "\nGreat! How many would you like to add to total inventory?\n"
        }
      ])
      .then(function(res) {
        addStock = parseInt(res.quantity)
        connection.query("SELECT stock_quantity FROM products WHERE item_id = " + itemInput, function(err, res) {
        currentStock = parseInt(res[0].stock_quantity)
        totalNewStock = addStock + currentStock
        var query = connection.query(
          "UPDATE products SET ? WHERE ?",
          [
            {
              stock_quantity: totalNewStock
            },
            {
              item_id: itemInput
            }
          ],
          function(err, res) {
            connection.query("SELECT * FROM products WHERE item_id = " + itemInput, function(err, res) {
              console.log("\n---------------------------------------------------------------------------------------")
              console.log("You have successfully added " + addStock + " units to " + res[0].product_name + ".")
              console.log("---------------------------------------------------------------------------------------\n")
              managerView()
            })
          })
        })
      })
    })
  })
}

function createProduct() {
  console.log("Creating a new product...\n")
  inquirer.prompt([
    {
      type: "input",
      name: "item",
      message: "Enter the name of the product you would like to add.\n"
    },
    {
      type: "input",
      name: "price",
      message:  "Enter the price you would like listed for this item.\n"
    },
    {
      type: "input",
      name: "quantity",
      message: "Enter the initial stock quantity of this item in your inventory.\n"
    },
    {
    type: 'list',
    name: 'department',
    message: 'What department does this product belong in?',
    choices: ['processors', 'gpu', 'ram', 'storage', 'displays'],
    }
  ]).then(function(answer) {
  var query = connection.query(
    "INSERT INTO products SET ?",
    {
      product_name: answer.item,
      price: answer.price,
      stock_quantity: answer.quantity,
      department_name: answer.department
    },
    function(err, res) {
      console.log(res.affectedRows + " product inserted!\n");
      managerView()
    })
  })
}


