import 'package:frutaon/src/models/order_model.dart';
import 'package:frutaon/src/pages/auth/controller/auth_controller.dart';
import 'package:frutaon/src/pages/orders/orders_result/orders_result.dart';
import 'package:frutaon/src/pages/orders/repository/order_repository.dart';
import 'package:frutaon/src/services/utils_services.dart';
import 'package:get/get.dart';


class AllOrdersController extends GetxController {
  List<OrderModel> allOrders = [];
  final ordersRepository = OrdersRepository();
  final authController = Get.find<AuthController>();
  final utilsServices = UtilsServices();

  @override
  void onInit() {
    super.onInit();

    getAllOrders();
  }

  Future<void> getAllOrders() async {
    OrdersResult<List<OrderModel>> result = await ordersRepository.getAllOrders(
      userId: authController.user.id!,
      token: authController.user.token!,
    );

    result.when(
      success: (orders) {
        allOrders = orders
          ..sort((a, b) => b.createdDateTime!.compareTo(a.createdDateTime!));
        update();
      },
      error: (message) {
        utilsServices.showToast(
          message: message,
          isError: true,
        );
      },
    );
  }
}