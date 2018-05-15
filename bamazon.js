var mysql = require("mysql")
var inquirer = require("inquirer")

var itemInput
var itemQuantity
var updatedQuantity
var itemOrdered
var orderCost

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
  listProducts()
})

function listProducts() {
  connection.query("SELECT * FROM products", function(err, res) {
    if (err) throw err;
    
    console.log("--------------------------------------------------------------------")
    for (var i = 0; i < res.length; i++) {

      console.log("Item ID: " + res[i].item_id, " || Product: " + res[i].product_name, " || Price: $" + res[i].price)
      console.log("--------------------------------------------------------------------")
    }
    inquirer.prompt([
      {
        type: "input",
        name: "item",
        message: "Enter the item ID of the product you would like to purchase."
      }
    ]).then(function(answer) {
      itemInput = answer.item
      
      inquirer.prompt([
        {
          type: "input",
          name: "quantity",
          message: "Great! How many would you like to purchase?"
        }
      ]).then(function(res) {
        itemQuantity = res.quantity
        checkQuantity()
      })
    })
  })
}

function checkQuantity() {
  connection.query("SELECT stock_quantity FROM products WHERE item_id = " + itemInput, function(err, res) {
    if (err) throw err;

    if (res[0].stock_quantity < itemQuantity) {
      console.log("Apologies, but we have insufficient stock to complete your order request.")
      console.log("We currently only have " + res[0].stock_quantity + " units available.  Please adjust your order request accordingly.")
    }
    else {
      updatedQuantity = res[0].stock_quantity - itemQuantity
      updateProduct(updatedQuantity, itemInput)
    }
  })
}

function updateProduct(quantity, item) {
  var query = connection.query(
    "UPDATE products SET ? WHERE ?",
    [
      {
        stock_quantity: quantity
      },
      {
        item_id: item
      }
    ],
    function(err, res) {
      connection.query("SELECT * FROM products WHERE item_id = " + itemInput, function(err, res) {
        itemOrdered = res[0].product_name
        orderCost = "$" + res[0].price * itemQuantity
        console.log("\nThank you for shopping with Bamazon!\n")
        console.log("------------------------------------------------------------")
        console.log("Your order of " + itemQuantity + " units of " + itemOrdered + " was successfully processed.")
        console.log("Your card was charged a total amount of: " + orderCost + ".")
        console.log("------------------------------------------------------------")
        console.log("\nYou can expect your product to be shipping....NEVER!  Mwuahahahahah!")
        
        connection.end()
      })
    }
  )
}
