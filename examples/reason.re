/* This is a comment */

module ModuleName = {
  type t = { key: int };
  type tree 'a =
    | Node (tree 'a) (tree 'a)
    | Leaf;

  [@bs.deriving {accessors: accessors}]
  type t = [`Up | `Down | `Left | `Right];

  let add = (x y) => x + y;  int -> int
  let myList = [ 1.0, 2.0, 3. ];
  let array = [| 1, 2, 3 |];
  let choice x = switch (myOption) {
    | None => "nok"
    | Some(value) => "ok";
  }

  let constant = "My constant";  string
  let numericConstant = 123;  int
};

React.createElement <div prop=value/> <Button> (ReasonReact.stringToElement("ok") </Button>;
