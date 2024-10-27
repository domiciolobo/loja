const Gerencianet = require("gn-api-sdk-node");
const Category = Parse.Object.extend("Category");
const Product = Parse.Object.extend("Product");
const CartItem = Parse.Object.extend("CartItem");
const Order = Parse.Object.extend("Order");
const OrderItem = Parse.Object.extend("OrderItem");
const GnEvent = Parse.Object.extend("GnEvent");

var options = {
  // PRODUÇÃO = false
  // HOMOLOGAÇÃO = true
  sandbox: false,
  client_id: "Client_Id_053a16513ad44f58f863bf4420ebd1198eb2ae87",
  client_secret: "Client_Secret_5040d6310515a420d24c15538399268f6813eecb",
  pix_cert: __dirname + "/producao-586986-FrutaOn.p12",
};

Date.prototype.addSeconds = function (s) {
  this.setSeconds(this.getTime() + s * 1000);
  return this;
};

// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
Parse.Cloud.define("hello", () => {
  return "Hello world! From frutasOn";
});

Parse.Cloud.define("get-product-list", async (req) => {
  const queryProducts = new Parse.Query(Product);

  // Condições da query

  if (req.params.title != null) {
    queryProducts.fullText("title", req.params.title);
    //queryProducts.matches('title', '.*' + req.params.title + '.*');
  }

  if (req.params.categoryId != null) {
    const category = new Category();
    category.id = req.params.categoryId;

    queryProducts.equalTo("category", category);
  }

  const itemsPerPage = req.params.itemsPerPage || 20;
  if (itemsPerPage > 100) throw "Quantidade inválida de itens por página";

  queryProducts.skip(itemsPerPage * req.params.page || 0);
  queryProducts.limit(itemsPerPage);

  queryProducts.include("category");

  const resultProducts = await queryProducts.find({ useMasterKey: true });

  return resultProducts.map(function (p) {
    p = p.toJSON();
    return formatProduct(p);
  });
});

Parse.Cloud.define("get-category-list", async (req) => {
  const queryCategories = new Parse.Query(Category);

  //condição

  const resultCategories = await queryCategories.find({ useMasterKey: true });
  return resultCategories.map(function (p) {
    p = p.toJSON();
    return {
      title: p.title,
      id: p.objectId,
    };
  });
});
//Final GET category

Parse.Cloud.define("signup", async (req) => {
  if (req.params.fullname == null) throw "INVALIDO NOME COMPLETO";
  if (req.params.phone == null) throw "Telefone INVALIDO";
  if (req.params.cpf == null) throw "INVALIDO CPF";

  const user = new Parse.User();

  user.set("username", req.params.email);
  user.set("email", req.params.email);
  user.set("password", req.params.password);
  user.set("fullname", req.params.fullname);
  user.set("phone", req.params.phone);
  user.set("cpf", req.params.cpf);

  try {
    const resultUser = await user.signUp(null, { useMasterKey: true });
    const userJson = resultUser.toJSON();
    return formatUser(userJson);
  } catch (e) {
    throw "INVALID_DATA";
  }
});
//Final signup

Parse.Cloud.define("login", async (req) => {
  try {
    const user = await Parse.User.logIn(req.params.email, req.params.password);
    const userJson = user.toJSON();
    return formatUser(userJson);
  } catch (e) {
    throw "INVALID_CREDENTIALS";
  }
});
//Final login

Parse.Cloud.define("validade-token", async (req) => {
  try {
    return formatUser(req.user.toJSON());
  } catch (e) {
    throw "INVALID_TOKEN";
  }
});
//Final validade-token

Parse.Cloud.define("change-password", async (req) => {
  if (req.user == null) throw "INVALID_USER";

  const user = await Parse.User.logIn(
    req.params.email,
    req.params.currentPassword
  );
  if (user.id != req.user.id) throw "INVALID_USER";
  user.set("password", req.params.newPassword);
  await user.save(null, { useMasterKey: true });
});

Parse.Cloud.define("reset-password", async (req) => {
  await Parse.User.requestPasswordReset(req.params.email);
});
//Final reset-password

Parse.Cloud.define("add-item-to-cart", async (req) => {
  if (req.params.quantity == null) throw "INVALID_QUANTITY";

  const cartItem = new CartItem();
  cartItem.set("quantity", req.params.quantity);

  const product = new Product();
  product.id = req.params.productId;

  cartItem.set("product", product);
  cartItem.set("user", req.user);

  const savedItem = await cartItem.save(null, { useMasterKey: true });
  return savedItem.id;
});
//Final add-item-to-cart

Parse.Cloud.define("modify-item-quantity", async (req) => {
  if (req.params.cartItemId == null) throw "INVALID_CART_ITEM";
  if (req.params.quantity == null) throw "INVALID_QUATITY";

  const cartItem = new CartItem();
  cartItem.id = req.params.cartItemId;
  if (req.params.quantity > 0) {
    cartItem.set("quantity", req.params.quantity);
    await cartItem.save(null, { useMasterKey: true });
  } else {
    await cartItem.destroy(null, { useMasterKey: true });
  }
});
//Final modify-item-quantity

Parse.Cloud.define("get-cart-items", async (req) => {
  if (req.user == null) throw "INVALID_USER";

  queryCartItems = new Parse.Query(CartItem);
  queryCartItems.equalTo("user", req.user);
  queryCartItems.include("product");
  queryCartItems.include("product.category");
  resultCartItems = await queryCartItems.find({ useMasterKey: true });
  return resultCartItems.map(function (c) {
    c = c.toJSON();
    return {
      id: c.objectId,
      quantity: c.quantity,
      product: formatProduct(c.product),
    };
  });
});
//Final GET CART ITEMS

Parse.Cloud.define("checkout", async (req) => {
  if (req.user == null) throw "INVALID_USER";

  const queryCartItems = new Parse.Query(CartItem);
  queryCartItems.equalTo("user", req.user);
  queryCartItems.include("product");

  const resultCartItems = await queryCartItems.find({ useMasterKey: true });
  let total = 0;

  for (let item of resultCartItems) {
    item = item.toJSON();
    total += item.quantity * item.product.price;
  }
  if (req.params.total != total) throw "INVALID_TOTAL";

  const dueSeconds = 3600;
  const due = new Date().addSeconds(dueSeconds); //vencimento do qrcode

  const charge = await createCharge(
    dueSeconds,
    req.user.get("cpf"),
    req.user.get("fullname"),
    total
  );
  const qrCodeData = await generateQRcode(charge.loc.id);

  const order = new Order();
  order.set("total", total);
  order.set("user", req.user);
  order.set("dueDate", due);
  order.set("qrCodeImage", qrCodeData.imagemQrcode);
  order.set("qrCode", qrCodeData.qrcode);
  order.set("txid", charge.txid);
  order.set("status", "pending_payment");
  const savedOrder = await order.save(null, { useMasterKey: true });

  for (let item of resultCartItems) {
    const orderItem = new OrderItem();
    orderItem.set("order", savedOrder);
    orderItem.set("user", req.user);
    orderItem.set("product", item.get("product"));
    orderItem.set("quantity", item.get("quantity"));
    orderItem.set("price", item.toJSON().product.price);
    await orderItem.save(null, { useMasterKey: true });
  }

  await Parse.Object.destroyAll(resultCartItems, { useMasterKey: true });

  return {
    id: savedOrder.id,
    total: total,
    qrCodeImage: qrCodeData.imagemQrcode,
    copiaecola: qrCodeData.qrcode,
    due: due.toISOString(),
    status: "pending_payment",
  };
});
//Final checkout

Parse.Cloud.define('get-orders', async (req) => {
	if(req.user == null) throw 'INVALID_USER';

	const queryOrders = new Parse.Query(Order);
	queryOrders.equalTo('user', req.user);
	const resultOrders = await queryOrders.find({useMasterKey: true});
	return resultOrders.map(function (o) {
		o = o.toJSON();
		return {
			id: o.objectId,
			total: o.total,
			createdAt: o.createdAt,
			due: o.dueDate.iso,
			qrCodeImage: o.qrCodeImage,
			copiaecola: o.qrCode,
			status: o.status,
		}
	});
});

//Final GET-ORDERS
Parse.Cloud.define("get-order-items", async (req) => {
  if (req.user == null) throw "INVALID_USER NULL";
  if (req.params.orderId == null) throw "INVALID_ORDER";

  const order = new Order();
  order.id = req.params.orderId;

  const queryOrderItems = new Parse.Query(OrderItem);
  queryOrderItems.equalTo("order", order);
  queryOrderItems.equalTo("user", req.user);
  queryOrderItems.include("product");
  queryOrderItems.include("product.category");
  const resultOrderItems = await queryOrderItems.find({ useMasterKey: true });
  return resultOrderItems.map(function (o) {
    o = o.toJSON();
    return {
      id: o.objectId,
      quantity: o.quantity,
      price: o.price,
      product: formatProduct(o.product),
    };
  });
});

Parse.Cloud.define("refund-order", async (req) => {
  if (req.params.orderId == null) throw "INVALID_ORDER";

  const queryOrder = new Parse.Query(Order);
  let order;
  try {
    order = await queryOrder.get(req.params.orderId, { useMasterKey: true });
  } catch (e) {
    throw "INVALID_ORDER";
  }

  if (order.get("status") != "paid") throw "INVALID_STATUS";

  await pixDevolution(
    order.get("total"),
    order.get("e2eId"),
    new Date().getTime()
  );

  order.set("status", "requested_refund");
  await order.save(null, { useMasterKey: true });
});
// FINAL FUNÇÂO DA DEVOLUÇÃO

Parse.Cloud.define("webhook", async (req) => {
	if (req.user == null) throw "INVALID_USER 1";
	if (req.user != "EFsqrSsE8A") throw "INVALID_USER";
  return "Ola mundo";
});

Parse.Cloud.define('pix', async (req) => {
	if(req.user == null) throw 'INVALID_USER';
	if(req.user.id != 'EFsqrSsE8A') throw 'INVALID_USER';

	for(const e of req.params.pix) {
		const gnEvent = new GnEvent();
		gnEvent.set('eid', e.endToEndId);
		gnEvent.set('txid', e.txid);
		gnEvent.set('event', e);
		await gnEvent.save(null, {useMasterKey: true});

		const query = new Parse.Query(Order);
        query.equalTo('txid', e.txid);
        
        const order = await query.first({useMasterKey: true});
        if(order == null) {
            throw 'NOT_FOUND';
        }

		if(e.devolucoes == null) {
			order.set('status', 'paid');
			order.set('e2eId', e.endToEndId);
		} else {
			if(e.devolucoes[0].status == 'EM_PROCESSAMENTO') {
                order.set('status', 'pending_refund');
            } else if(e.devolucoes[0].status == 'DEVOLVIDO') {
                order.set('status', 'refunded');
            }
		}
		
		await order.save(null, {useMasterKey: true});
	}
});


Parse.Cloud.define("config-webhook", async (req) => {
  // const gerencianet = require('sdk-node-apis-efi');
  let body = {
    webhookUrl: "https://api.frutaon.com.br/prod/webhook",
  };

  let params = {
    chave: "frutaon@gmail.com",
  };

  var gerencianet = new Gerencianet(options);
  return await gerencianet.pixConfigWebhook(params, body);
});

async function pixDevolution(value, e2eId, id) {
  let body = {
    valor: value.toFixed(2),
  };

  let params = {
    e2eId: e2eId,
    id: id,
  };

  return await gerencianet.pixDevolution(params, body);
}

async function createCharge(dueSeconds, cpf, fullname, price) {
  let body = {
    calendario: {
      expiracao: dueSeconds,
    },
    devedor: {
      cpf: cpf.replace(/\D/g, ""),
      nome: fullname,
    },
    valor: {
      original: price.toFixed(2),
    },
    chave: "frutaon@gmail.com", // Informe sua chave Pix cadastrada na gerencianet
  };

  var gerencianet = new Gerencianet(options);
  const response = await gerencianet.pixCreateImmediateCharge([], body);
  return response;
}

async function generateQRcode(locId) {
  let params = {
    id: locId,
  };

  var gerencianet = new Gerencianet(options);
  const response = await gerencianet.pixGenerateQRCode(params);
  return response;
}

Parse.Cloud.define("list-charges", async (req) => {
  let params = {
    inicio: req.params.inicio,
    fim: req.params.fim,
  };

  var gerencianet = new Gerencianet(options);
  return await gerencianet.pixListCharges(params);
});

async function pixDevolution(value, e2eId, id) {
  let body = {
    valor: value.toFixed(2),
  };

  let params = {
    e2eId: e2eId,
    id: id,
  };
  var gerencianet = new Gerencianet(options);
  return await gerencianet.pixDevolution(params, body);
}

function formatUser(userJson) {
  return {
    id: userJson.objectId,
    username: userJson.username,
    email: userJson.email,
    fullname: userJson.fullname,
    phone: userJson.phone,
    cpf: userJson.cpf,
    token: userJson.sessionToken,
  };
}

function formatProduct(productJson) {
  return {
    id: productJson.objectId,
    title: productJson.title,
    description: productJson.description,
    price: productJson.price,
    unit: productJson.unit,
    picture: productJson.picture != null ? productJson.picture.url : null,
    category: {
      title: productJson.category.title,
      id: productJson.category.objectId,
    },
  };
}

module.exports = { formatProduct };
