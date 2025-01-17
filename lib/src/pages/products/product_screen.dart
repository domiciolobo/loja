import 'package:flutter/material.dart';
import 'package:frutaon/src/config/custom_colors.dart';
import 'package:frutaon/src/models/item_model.dart';
import 'package:frutaon/src/pages/base/controller/navigation_controller.dart';
import 'package:frutaon/src/pages/cart/controller/cart_controller.dart';
import 'package:frutaon/src/pages/common_widgets/quantity_widget.dart';
import 'package:frutaon/src/services/utils_services.dart';
import 'package:get/get.dart';

class ProductScreen extends StatefulWidget {
  ProductScreen({
    super.key,
  });

  final ItemModel item = Get.arguments;

  @override
  State<ProductScreen> createState() => _ProductScreenState();
}

class _ProductScreenState extends State<ProductScreen> {
  final UtilsServices utilsServices = UtilsServices();

  int carItemQuantity = 1;

  final cartController = Get.find<CartController>();
  final navigationController = Get.find<NavigationController>();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white.withAlpha(230),
      body: Stack(
        children: [
          Column(
            children: [
              Expanded(
                child: Hero(
                    tag: widget.item.imgUrl,
                    child: Image.network(widget.item.imgUrl)),
              ),
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(32),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: const BorderRadius.vertical(
                      top: Radius.circular(50),
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.grey.shade600,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      //Nome - Quantidade
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              widget.item.itemName,
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 27,
                              ),
                            ),
                          ),
                          QuantityWidget(
                            suffixText: widget.item.unit,
                            value: carItemQuantity,
                            result: (quantity) {
                              setState(() {
                                carItemQuantity = quantity;
                              });
                            },
                          ),
                        ],
                      ),

                      //preco
                      Text(
                        utilsServices.priceToCurrency(widget.item.price),
                        style: TextStyle(
                          fontSize: 23,
                          fontWeight: FontWeight.bold,
                          color: CustomColors.customConstrastColor,
                        ),
                      ),

                      Expanded(
                        child: Padding(
                          padding: const EdgeInsets.symmetric(
                            vertical: 10,
                          ),
                          child: SingleChildScrollView(
                            child: Text(
                              widget.item.description,
                              style: const TextStyle(
                                height: 1.5,
                              ),
                            ),
                          ),
                        ),
                      ),

                      SizedBox(
                        height: 55,
                        child: ElevatedButton.icon(
                          style: ElevatedButton.styleFrom(
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(15),
                            ),
                          ),
                          onPressed: () {
                            // Fechar a tela
                            Get.back();
                            cartController.addItemToCart(
                                item: widget.item, quantity: carItemQuantity);
                            // abrir o carrinho
                            navigationController
                                .navigatePageView(NavigationTabs.cart);
                          },
                          label: const Text(
                            'Add no Carrinho',
                            style: TextStyle(
                                fontSize: 18, fontWeight: FontWeight.bold),
                          ),
                          icon: const Icon(
                            Icons.shopping_cart_outlined,
                            color: Colors.yellow,
                          ),
                        ),
                      )
                    ],
                  ),
                ),
              ),
            ],
          ),
          Positioned(
            left: 10,
            top: 10,
            child: SafeArea(
              child: IconButton(
                onPressed: () => Navigator.of(context).pop(),
                icon: const Icon(
                  Icons.arrow_back_ios,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
