import 'package:flutter/material.dart';
import 'package:frutaon/src/pages/orders/controller/all_controller.dart';
import 'package:frutaon/src/pages/orders/view/components/order_tile.dart';
import 'package:get/get_state_manager/src/simple/get_state.dart';

class OrdersTabs extends StatelessWidget {
  const OrdersTabs({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Pedidos'),
      ),
      body: GetBuilder<AllOrdersController>(
        builder: (controller) {
          return RefreshIndicator(
            onRefresh: () => controller.getAllOrders(),
            child: RefreshIndicator(
              onRefresh: () => controller.getAllOrders(),
              child: ListView.separated(
                padding: const EdgeInsets.all(16),
                physics: const BouncingScrollPhysics(),
                separatorBuilder: (_, index) => const SizedBox(height: 10),
                itemBuilder: (_, index) =>
                    OrderTile(order: controller.allOrders[index]),
                itemCount: controller.allOrders.length,
              ),
            ),
          );
        },
      ),
    );
  }
}
