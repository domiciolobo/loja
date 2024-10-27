import 'package:get/get.dart';

String? emaiValidator(String? email) {
  if (email == null || email.isEmpty) {
    return 'Digite seu Email';
  }
  if (!email.isEmail) {
    return 'Digite um email valido!';
  }
  return null;
}

String? passwordValidator(password) {
  if (password == null || password.isEmpty) {
    return 'Digite sua Senha!';
  }
  if (password.length < 7) {
    return 'Digite uma senha com pelo menos  7 Caracter';
  }

  return null;
}

String? nameValidator(String? name) {
  if (name == null || name.isEmpty) {
    return 'Digite seu Nome Completo!';
  }

  final names = name.split(' ');

  if (names.length == 1) return 'Digite seu nome Completo!';

  return null;
}

String? phoneValidator(String? phone) {
  if (phone == null || phone.isEmpty) {
    return 'Digite seu Celular';
  }
  if (phone.length < 14 || !phone.isPhoneNumber) {
    return 'Digite um numero Válido';
  }
  return null;
}

String? cpfvalidator(String? cpf) {
  if (cpf == null || cpf.isEmpty) {
    return 'Digite seu CPF';
  }
  if (!cpf.isCpf) return 'Digite um cpf valido!';
  return null;
}
