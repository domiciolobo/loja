import 'package:frutaon/src/constants/endpoints.dart';
import 'package:frutaon/src/models/category_model.dart';
import 'package:frutaon/src/models/item_model.dart';
import 'package:frutaon/src/pages/home/result/home_result.dart';
import 'package:frutaon/src/services/http_manager.dart';

class HomeRespository {
  final HttpManager _httpManager = HttpManager();

  Future<({List<CategoryModel>? categories, String? errorMessage})>
      getAllCategories() async {
    final result = await _httpManager.restRequest(
      url: Endpoints.getAllCategories,
      method: HttpMethods.post,
    );

    if (result['result'] != null) {
      List<CategoryModel> data =
          (List<Map<String, dynamic>>.from(result['result']))
              .map(CategoryModel.fromJson)
              .toList();

      // No caso de sucesso retornamos a lista de categorias e passamos um valor nulo na mensagem de erro.
      return (categories: data, errorMessage: null);
    } else {
      // Em caso de erro passamos um valor nulo na lista e uma mensagem de erro
      return (
        categories: null,
        errorMessage: 'Ocorreu um erro inesperado ao recuperar as categorias'
      );
    }
  }

  Future<HomeResult<ItemModel>> getAllProducts(
      Map<String, dynamic> body) async {
    final result = await _httpManager.restRequest(
      url: Endpoints.getAllProducts,
      method: HttpMethods.post,
      body: body,
    );

    if (result['result'] != null) {
      List<ItemModel> data = List<Map<String, dynamic>>.from(result['result'])
          .map(ItemModel.fromJson)
          .toList();

      return HomeResult<ItemModel>.success(data);
    } else {
      return HomeResult.error(
          'Ocorreu um erro inesperado ao recuperar os itens');
    }
  }
}
