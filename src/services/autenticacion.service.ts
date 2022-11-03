import { /* inject, */ BindingScope, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {Llaves} from '../config/llaves';
import {Persona} from '../models';
import {PersonaRepository} from '../repositories';
// En el servicio Autenticacion, importar password-generator, luego del import.
const generador = require('password-generator');
// En el servicio Autenticacion, importar crypto-js.
const cryptoJS = require('crypto-js');
// Una vez instalado, se debe importar o asignarlo a una constante donde se vaya a utilizar
const jwt = require('jsonwebtoken');

@injectable({scope: BindingScope.TRANSIENT})
export class AutenticacionService {
  constructor(/* Add @inject to inject parameters */
    @repository(PersonaRepository)
    public personaRepository: PersonaRepository
  ) { }

  /*
   * Add service methods here
   */
  GenerarClave() {
    let clave = generador(8, false);
    return clave;
  }

  CifrarClave(clave: string) {
    let claveCifrada = cryptoJS.MD5(clave).toString();
    return claveCifrada;
  }

  IdentificarPersona(usuario: string, clave: string) {
    try {
      let p = this.personaRepository.findOne({
        where: {
          correo: usuario,
          clave: clave
        }
      });
      if (p) {
        return p;
      }
      return false;
    } catch {
      return false;
    }
  }

  GenerarTokenJWT(persona: Persona) {
    let token = jwt.sign({
      data: {
        id: persona.id,
        correo: persona.correo,
        nombre: persona.nombres + " " + persona.apellidos
      }
    },
      Llaves.llaveJWT);
    return token;
  }

  ValidarTokenJWT(token: string) {
    try {
      let datos = jwt.verify(token, Llaves.llaveJWT);
      return datos;
    } catch {
      return false;
    }
  }


}
