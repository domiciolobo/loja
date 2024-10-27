import 'package:frutaon/src/constants/storage_keys.dart';
import 'package:frutaon/src/models/user_model.dart';
import 'package:frutaon/src/pages/auth/respository/auth_respository.dart';
import 'package:frutaon/src/pages/auth/result/auth_result.dart';
import 'package:frutaon/src/pages_routes/app_pages.dart';
import 'package:get/get.dart';
import 'package:frutaon/src/services/utils_services.dart';

class AuthController extends GetxController {
  RxBool isLoading = false.obs;
  final authRepository = AuthRepository();
  final utilsServices = UtilsServices();
  UserModel user = UserModel();

  @override
  void onInit() {
    super.onInit();
    validateToken();
  }

  Future<void> validateToken() async {
    //recuperar token salvo localmente
    String? token = await utilsServices.getLocalData(key: StorageKeys.token);
    if (token == null) {
      Get.offNamed(PagesRoutes.signInRoute);
      return;
    }

    AuthResult result = await authRepository.validateToken(token);
    result.when(
      success: (user) {
        this.user = user;
        saveTokenAndProceedToBase();
      },
       error: (message) {
        signOut();
      },
    );
  }

  Future<void> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    isLoading.value = true;

    final result = await authRepository.changePassword(
      email: user.email!,
      currentPassword: currentPassword,
      newPassword: newPassword,
      token: user.token!,
    );

    isLoading.value = false;

    if (result) {
      utilsServices.showToast(
        message: 'A senha foi atualizada com sucesso!',
      );

      signOut();
    } else {
      utilsServices.showToast(
        message: 'A senha atual está incorreta',
        isError: true,
      );
    }
  }

  Future<void> signOut() async {
    //zera o user
    user = UserModel();
    //remover o tokebn localmente
    await utilsServices.removeLocalData(key: StorageKeys.token);
    //ir para login
    Get.offNamed(PagesRoutes.signInRoute);
  }

  saveTokenAndProceedToBase() {
    //salvar o token
    utilsServices.saveLocalData(key: StorageKeys.token, data: user.token!);
    //ir para base
    Get.offNamed(PagesRoutes.baseRoute);
  }

  Future<void> singUp() async {
    isLoading.value = true;
    AuthResult result = await authRepository.signUp(user);

    isLoading.value = false;
    result.when(
      success: (user) {
        this.user = user;
        saveTokenAndProceedToBase();
      },
       error: (message) {
        utilsServices.showToast(
          message: message,
          isError: true,
        );
      },
    );
  }

  Future<void> resetPassword(String email) async {
    await authRepository.resetPassword(email);
  }

  Future<void> signIn({
    required String email,
    required String password,
  }) async {
    isLoading.value = true;

    AuthResult result =
        await authRepository.signIn(email: email, password: password);

    isLoading.value = false;

    result.when(
      success: (user) {
        this.user = user;

        saveTokenAndProceedToBase();
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
