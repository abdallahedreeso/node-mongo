const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ = require('lodash');
// const { name } = require('ejs');

const app = express();

const listItems = [];
const workItems = [];

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://abdallahedreeso2:ZL6SbjHnCsvAC8t8@cluster0.n63nu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0/todolistDB").then(() => {
  app.listen(3000, function() {
    console.log("Server running on port 3000.");
  });

});

const itemsSchema = {
  name: String
}

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const Item = mongoose.model("Item", itemsSchema);
const List = mongoose.model("List", listSchema);

const item1 = new Item({
  name: "Welcome to your todolist!"
});

const item2 = new Item({
  name: "Hit the + button to add a new item."
});

const item3 = new Item({
  name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

// GET request to root route
app.get("/", function(req, res) {
  Item.find()
  .then((items) => {
    if(items.length === 0){
      // if no items in DB, insert default items
      // and redirect to root route
      // to render the default items
      Item.insertMany(defaultItems)
      .then(() => { console.log("Successfully saved default items to DB."); })
      .catch((err) => { console.log(err); });
      res.redirect("/");
    }
    else {
      res.render("list", {
        listTitle: "Today",
        listItems: items
      });
    }
  })
  .catch((err) => { console.log(err); });

});

// GET request to custom route
app.get("/:customListName", (req, res) => {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName})
      .then((list) => {
        if(!list){
          const list = new List({
            name: customListName,
            items: defaultItems
          })

          list.save();
          res.redirect("/" + customListName);
        }
        else {
          res.render("list", {
            listTitle: list.name,
            listItems: list.items
          });
        }
      })
})

// POST request to root route
app.post("/", function(req, res){

  const itemName = req.body.newTodo;
  const listName = req.body.list;

  if(itemName === ""){
    res.redirect("/");
  }
  else {
    const item = new Item({
      name: itemName
    });

    if(listName === "Today"){
      item.save()
      .then(() => { console.log("Successfully saved item to DB."); })
      .catch((err) => { console.log(err); });

      res.redirect("/");
    } else {
      List.findOne({name: listName})
          .then((list) => {
            list.items.push(item);
            list.save();
            res.redirect("/" + listName);
          })
    }
  }
});

// POST request to delete route
app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndDelete(checkedItemId)
      .then(() => { console.log("Successfully removed item from DB."); })
      .catch((err) => { console.log(err); });

    res.redirect("/");
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}})
        .then(() => { console.log("Successfully removed item from list."); })
        .catch((err) => { console.log(err); });

    res.redirect("/" + listName);
  }
});





// "mongodb+srv://abdallahedreeso2:EdReeSoo@1@cluster0.e5rr8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
// abdallahedreeso2
// ZL6SbjHnCsvAC8t8