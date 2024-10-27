
// const Category = Parse.Object.extend('Category');
// const Product = Parse.Object.extend('Product');
// const CartItem = Parse.Object.extend('CartItem');
// const Order = Parse.Object.extend('Order');
// const OrderItem = Parse.Object.extend('OrderItem');

// // Use Parse.Cloud.define to define as many cloud functions as you want.
// // For example:
// Parse.Cloud.define("hello", (req) => {
// 	return "Hello world! From frutasOn";
// });

// Parse.Cloud.define('get-product-list', async (req) =>{
// 	const queryProducts = new Parse.Query(Product);

// 	//Condiçoes da Query

// 	if(req.params.title != null){
// 	// buscar
// 		//queryProducts.matches('title', '.*' + req.params.title + '.*');
// 		queryProducts.fullText('title', req.params.title);
// 	}
// 	if(req.params.categoryId != null){
// 		const category = new Category();
// 		category.id = req.params.categoryId;

// 		queryProducts.equalTo('category', category);
// 	}
// 		//Busca por categoria e Ponteiro
// 	const itemsPerPage = req.params.itemsPerPage || 20;
// 	if(itemsPerPage > 100) throw 'quantidade inválida';

// 	queryProducts.skip(itemsPerPage * req.params.page || 0 );
// 	queryProducts.limit(itemsPerPage);

// 	queryProducts.include('category');
	
// 	const resultProducts = await queryProducts.find({useMasterKey: true});

// 	return resultProducts.map(function(p){
// 		p = p.toJSON();
// 		return formatProduct(p);
		
// 	});

// });

// Parse.Cloud.define('get-category-list', async(req) => {


// 	const queryCategories = new Parse.Query(Category);

// 	//condição

// 	const resultCategories = await queryCategories.find({useMasterKey: true});
// 	return resultCategories.map(function(p){
// 		p = p.toJSON();
// 		return {
// 			title: p.title,
// 			id: p.objectId,
// 		}
// 		});
// });
// //Final GET category

// Parse.Cloud.define('signup', async(req) => {
// 	if(req.params.fullname == null) throw 'INVALIDO NOME COMPLETO';
// 	if(req.params.phone == null) throw 'Telefone INVALIDO';
// 	if(req.params.cpf == null) throw 'INVALIDO CPF';


// 	const user = new Parse.User();



// 	user.set('username', req.params.email);
// 	user.set('email', req.params.email);
// 	user.set('password', req.params.password);
// 	user.set('fullname', req.params.fullname);
// 	user.set('phone',req.params.phone);
// 	user.set('cpf', req.params.cpf);


// 	try{
// 	const resultUser = await user.signUp(null, {useMasterKey:true});
// 	const userJson = resultUser.toJSON();		
// 		return formatUser(userJson); 
// 	}catch(e){
// 		throw 'INVALID_DATA';
// 	}	
	
// });
// //Final signup

// Parse.Cloud.define('login', async (req) => {
// 	try {
// 	const user = await Parse.User.logIn(req.params.email, req.params.password);
// 	const userJson = user.toJSON();
// 	return formatUser(userJson);

// 	} catch (e){
// 		throw 'INVALID_CREDENTIALS';
// 	}
// });
// //Final login

// Parse.Cloud.define('validade-token', async(req)=>{
// 	try{
// 		return formatUser(req.user.toJSON());
// 	}catch (e){
// 		throw 'INVALID_TOKEN';
// 	}
// });
// //Final validade-token

// Parse.Cloud.define('change-password', async (req) =>{

// 	if(req.user == null)throw 'INVALID_USER';

// 	const user = await Parse.User.logIn(req.params.email, req.params.currentPassword);
// 	if(user.id != req.user.id) throw 'INVALID_USER';
// 	user.set('password', req.params.newPassword);
// 	await user.save(null, {useMasterKey: true});


// });

// Parse.Cloud.define('reset-password', async(req) =>{
// await	Parse.User.requestPasswordReset(req.params.email);
// });
// //Final reset-password

// Parse.Cloud.define('add-item-to-cart', async(req) =>{
// 	if(req.params.quantity == null)throw "INVALID_QUANTITY";

// 	const cartItem = new CartItem();
// 	cartItem.set('quantity', req.params.quantity);

// 	const product = new Product();
// 	product.id = req.params.productId;

// 	cartItem.set('product', product);
// 	cartItem.set('user', req.user);

// 	const savedItem = await cartItem.save(null, {useMasterKey: true});
// 	return savedItem.id;


// });
// //Final add-item-to-cart

// Parse.Cloud.define('modify-item-quantity', async (req)=>{
// 	if(req.params.cartItemId == null)throw "INVALID_CART_ITEM";
// 	if(req.params.quantity == null)throw "INVALID_QUATITY";


// 	const cartItem = new CartItem();
// 	cartItem.id = req.params.cartItemId;
// 	if(req.params.quantity > 0){
// 	cartItem.set('quantity', req.params.quantity);
// 	await cartItem.save(null, {useMasterKey: true});
// 	}else{
// 		await cartItem.destroy(null, {useMasterKey: true});
// 	}
// });
// //Final modify-item-quantity


// Parse.Cloud.define('get-cart-items', async (req) => {
// 	const queryCartItems = new Parse.Query(CartItem);
// 	queryCartItems.equalTo('user', req.user);
// 	queryCartItems.include('product');
// 	queryCartItems.include('product.category');
// 	const resultCartItems = await queryCartItems.find({useMasterKey:true});
	
// 	return resultCartItems.map(function(c){
// 		c = c.toJSON();
// 		return {
// 		id: c.objectId,
// 		quantity: c.quantity,
// 		product: formatProduct(c.product),
// 	}

	
// 	});
// });
// //Final GET CART ITEMS

// Parse.Cloud.define('checkout', async (req) => {
// 	if(req.user == null) throw 'INVALID_USER';

// 	const queryCartItems = new Parse.Query(CartItem);
// 	queryCartItems.equalTo('user', req.user);
// 	queryCartItems.include('product');
// 	const resultCartItems = await queryCartItems.find({useMasterKey:true});
// 	let total = 0;

// 	for(let item of resultCartItems){
// 		item = item.toJSON();
// 		total += item.quantity * item.product.price;
// 	}
// 	if(req.params.total != total) throw 'INVALID_TOTAL';

// 	const order = new Order();
// 	order.set('total', total);
// 	order.set('user', req.user);
// 	const savedOrder = await order.save(null, {useMasterKey:true});

// 	for(let item of resultCartItems){
// 		const orderItem = new OrderItem();
// 		orderItem.set('order', savedOrder);
// 		orderItem.set('product',item.get('product'));
// 		orderItem.set('quantity', item.get('quantity'));
// 		orderItem.set('price', item.toJSON().product.price);
// 		await orderItem.save(null, {useMasterKey:true});
		
// 	}

// 	await Parse.Object.destroyAll(resultCartItems, {useMasterKey:true});

// 	return{
// 		id: savedOrder.id,
// 	}

// }); 
// //Final checkout

// Parse.Cloud.define('get-orders', async (req) =>{
// 	if(req.user == null) throw 'INVALID_USER';

// 	const queryOrders = new Parse.Query(Order);
// 	queryOrders.equalTo('user',req.user);
// 	const resultOrdes = await queryOrders.find({useMasterKey: true});
// 	return resultOrdes.map(function(o){
// 		o = o.toJSON();
// 		return{
// 			id: o.objectId,
// 			total: o.total,
// 			createdAt: o.createdAt

// 		}
// 	});
// });
// //Final GET-ORDERS
// Parse.Cloud.define('get-orders-items', async (req) =>{
// 	if(req.user == null) throw 'INVALID_USER';
// 	if(req.params.orderId == null) throw 'INVALID_ORDER';

// 	const order = new Order();
// 	order.id = req.params.orderId;

// 	const queryOrderItems = new Parse.Query(OrderItem);
// 	queryOrderItems.equalTo('order',order);
// 	queryOrderItems.equalTo('order',order);
// 	const resultOrdeItems = await queryOrderItems.find({useMasterKey:true});
// 	return resultOrdeItems.map(function (o){
// 		o = o.toJSON();
// 		return{
// 			id: o.objectId,
// 			quantity: o.quantity,
// 			price: o.price,
// 			product: o.product,
// 		}
// 	});

	
	
// });



// function formatUser (userJson){
// 	return {
// 		id: userJson.objectId,
// 		username: userJson.username,
// 		email: userJson.email,
// 		fullname: userJson.fullname,
// 		phone: userJson.phone,
// 		cpf: userJson.cpf,	
// 		token: userJson.sessionToken,
// 	};
// }

// function formatProduct (productJson) {
// 	return {
// 			id: productJson.objectId,
// 			title: productJson.title,
// 			description: productJson.description,
// 			price: productJson.price,
// 			unit: productJson.unit,
// 			picture: productJson.picture != null ? productJson.picture.url : null,
// 			category: {
// 				title: productJson.category.title,
// 				id: productJson.category.objectId,
// 			},
	
// 	};
// }
