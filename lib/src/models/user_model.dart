import 'package:json_annotation/json_annotation.dart';

part 'user_model.g.dart';

@JsonSerializable()
class UserModel {
  @JsonKey(name: 'fullname')
  String? name;
  String? email;
  String? phone;
  String? cpf;
  String? password;
  String? id;
  String? token;

  UserModel({
    this.cpf,
    this.email,
    this.name,
    this.password,
    this.id,
    this.token,
    this.phone,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) =>
      _$UserModelFromJson(json);

  Map<String, dynamic> tojson() => _$UserModelToJson(this);

  @override
  String toString() {
    return 'name: $name | cpf: $cpf';
  }
}
