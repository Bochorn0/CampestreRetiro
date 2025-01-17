/*const mssql = require("mssql");
const Excel = require('exceljs');
const xlsx =  require('node-xlsx');
const unstream =  require('unstream');
let moment = require('moment');
var fs = require("fs-extra");
const _ =  require("lodash");
let funcionesSQLServer = require("../../../shared/modules/funcionesSQLServer");
let sqlserver_odbc = require('../../../shared/db/sqlserver_odbc');
let sqlserver_datos001 = require('../../../shared/db/sqlserver_datos001');
let sqlserver_ct_integral = require('../../../shared/db/sqlserver_ct_integral');
let empleadoModel =  require('../../api_capital_humano/models/empleadoModel');
*/

const mysql =  require("../../../shared/db/mysql_driver");
const moment =  require("moment");
var fs = require("fs-extra");
var Excel = require('exceljs');
module.exports = class Catalogos {
    Base(solicitud){
        return new Promise((resolve, reject)=>{
            return resolve({status: `ok`});
        })
    }
    Catalogo_clientes(solicitud){
        return new Promise((resolve, reject)=>{
            // as cli JOIN Clientes_terrenos as cter on cli.IdCliente = cter.IdCliente JOIN Terrenos as ter on ter.IdTerreno = cter.IdTerreno;
            mysql.ejecutar('SELECT * from Clientes Where Activo = 1').then((res)=>{
                //let datosOrdenados =  this._ordenarClientesTerrenos(res);
                if(res[0]){
                    res.forEach(r=>{
                        let numCliente = ``;
                        for(let i = 1;i<= (4 - `${r.IdCliente}`.length);i++ ){
                            numCliente += `0`; 
                        }
                        r.Codigo += `${numCliente}${r.IdCliente}`; 
                        r.Saldo_total = r.Saldo_credito + r.Saldo_adeudo + r.Saldo_mantenimiento + r.Saldo_agua + r.Saldo_certificado +r.Saldo_anualidad;
                        //console.log('saldo',r);
                    })
                    return resolve({Data: res, error: false});
                }else{
                    return resolve({Data: [], error: false});
                }
            }).catch(err=>{ console.log('error',err); reject(err);})
        })
    }
    Catalogo_relaciones(solicitud){
        return new Promise((resolve, reject)=>{
            // as cli JOIN Clientes_terrenos as cter on cli.IdCliente = cter.IdCliente JOIN Terrenos as ter on ter.IdTerreno = cter.IdTerreno;
            mysql.ejecutar('SELECT * from Clientes_terrenos as cter JOIN Terrenos as ter on ter.IdTerreno = cter.IdTerreno').then((res)=>{
                console.log('res',res);
                return resolve({Data: res, error: false});
            }).catch(err=>{ console.log('error',err); reject(err);})
        })
    }
    Catalogo_gastos(solicitud){
        let categoriasTodas = {};
        return new Promise((resolve, reject)=>{
            mysql.ejecutar('SELECT * FROM Catalogo_gastos WHERE IdPadre = 0').then((res)=>{
                categoriasTodas.TodasPadres = res;
                return mysql.ejecutar('SELECT cg1.IdCategoria,cg1.Categoria as Categoria,cg2.IdCategoria as IdSubcategoria,cg2.Categoria as Subcategoria from Catalogo_gastos as cg1 JOIN Catalogo_gastos as cg2  on cg2.IdPadre = cg1.IdCategoria order by cg1.Categoria');
            }).then(res=>{
                categoriasTodas.Relacionadas = res;
                return resolve({Data: this._ordenarDatosCategoriasGastos(categoriasTodas), error: false});
            }).catch(err=>{ console.log('error',err); reject(err);})
        })
    }
    _ordenarDatosCategoriasGastos(datos){
        if(datos.Relacionadas[0]){
            let categorias = [];
            let subcategorias = [];
            let datosOrdenados;
            datos.Relacionadas.forEach(d=>{
                let existeCat =  categorias.find(ob=>ob.IdCategoria == d.IdCategoria);
                if(!existeCat){
                    categorias.push({IdCategoria: d.IdCategoria, Categoria: d.Categoria});
                }
                let existeSub =  subcategorias.find(ob=>ob.IdSubcategoria == d.IdSubcategoria);
                if(!existeSub){
                    subcategorias.push({IdSubcategoria: d.IdSubcategoria, Subcategoria: d.Subcategoria});
                }
            });
            datosOrdenados= {Categorias:categorias,Subcategorias:subcategorias,Juntos:datos.Relacionadas, TodasPadres :datos.TodasPadres};
            return datosOrdenados;
        }
        return false;
    }
    _ordenarRelacionesTerrenos(datos){
        if(datos){
            let datosOrdenados;
            datos.forEach(dat=>{
                datosOrdenados.push({IdCliente:dat.IdCliente,IdTerreno:dat.IdTerreno,Parcela:dat.parcela,
                Etapa:dat.etapa,Lote:dat.Lote,Pertenece:dat.Pertenece,Superficie:dat.Superficie});
            });
            return datosOrdenados;
        }
        return false;
    }
    _ordenarClientesTerrenos(datos){
        if(datos){
            //console.log('datos',datos);
            let datosTerreno = [];
            let datosCliente = [];
            datos.forEach(dat=>{
                let cliente = dat.IdCliente;
                let existe =  datosCliente.filter(ob=>ob.IdCliente =  dat.IdCliente);
                let terrenos =  datos.filter(ob=>ob.IdCliente =  dat.IdCliente);
                console.log('dat',dat);
                if(!existe){
                    console.log('dat',dat);
                    //Push datos cliente
                    console.log('terrenos',terrenos);
                    datosCliente.push({IdCliente:dat.IdCliente,IdArchivo_ife:dat.IdArchivo_ife,IdArchivo_comprobante:dat.IdArchivo_comprobante,
                        Nombre:dat.Nombre,Codigo:dat.Codigo,Correo:dat.Correo,Telefono:dat.Telefono,Direccion:dat.Direccion,Enganche:dat.Enganche,
                        Saldo_adeudo:dat.Saldo_adeudo,Saldo_credito:dat.Saldo_credito,Credito_original:dat.Credito_original,Num_ife:dat.Num_ife,
                        Referencia_1:dat.Referencia_1,Referencia_2:dat.Referencia_2,Referencia_3:dat.Referencia_3,Fecha_nacimiento:dat.Fecha_nacimiento,
                        Ultimo_movimiento:dat.Ultimo_movimiento,Activo:dat.Activo,Terrenos: terrenos});
                }
/*                datosTerreno.push({IdRelacion:dat.IdRelacion,IdUsuario:dat.IdUsuario,IdTerreno:dat.IdTerreno,IdCotizacion:dat.IdCotizacion,
                Parcela:dat.parcela,Etapa:dat.etapa,Lote:dat.Lote,Pertenece:dat.Pertenece,Superficie:dat.Superficie});*/
                //Datos Cliente
            });
            console.log('datosCliente',datosCliente);
        return datosCliente;
        }
    }
    Catalogo_empleados(solicitud){
        return new Promise((resolve, reject)=>{
            mysql.ejecutar('SELECT * FROM Empleados;').then((res)=>{
                return resolve({Data: res, error: false});
            }).catch(err=>{ console.log('error',err); reject(err);})
        })
    }
    Catalogo_ventas(solicitud){
        return new Promise((resolve, reject)=>{
            mysql.ejecutar('SELECT * FROM Ventas;').then((res)=>{
                return resolve({Data: res, error: false});
            }).catch(err=>{ console.log('error',err); reject(err);})
        })
    }
    Catalogo_tipo_ventas(solicitud){
        return new Promise((resolve, reject)=>{
            mysql.ejecutar('SELECT * FROM Catalogo_tipo_movimientos;').then((res)=>{
                return resolve({Data: res, error: false});
            }).catch(err=>{ console.log('error',err); reject(err);})
        })
    }
    Catalogo_tipo_gastos(solicitud){
        return new Promise((resolve, reject)=>{
            mysql.ejecutar('SELECT * FROM Catalogo_tipo_gastos;').then((res)=>{
                return resolve({Data: res, error: false});
            }).catch(err=>{ console.log('error',err); reject(err);})
        })
    }
    Catalogo_empleados(solicitud){
        return new Promise((resolve, reject)=>{
            mysql.ejecutar('SELECT * FROM Empleados;').then((res)=>{
                return resolve({Data: res, error: false});
            }).catch(err=>{ console.log('error',err); reject(err);})
        })
    }
    Catalogo_contratos(solicitud){
        return new Promise((resolve, reject)=>{
            mysql.ejecutar('SELECT * FROM Contratos;').then((res)=>{
                return resolve({Data: res, error: false});
            }).catch(err=>{ console.log('error',err); reject(err);})
        })
    }
    Catalogo_tipos_documentos(){
        return new Promise((resolve, reject)=>{
            mysql.ejecutar('SELECT * FROM Documentos_tipos;').then((res)=>{
                return resolve({Data: res, error: false});
            }).catch(err=>{ console.log('error',err); reject(err);})
        })
    }
    Catalogo_documentos(solicitud){
        return new Promise((resolve, reject)=>{
            mysql.ejecutar('SELECT * FROM Documentos_apartados;').then((res)=>{
                return resolve({Data: res, error: false});
            }).catch(err=>{ console.log('error',err); reject(err);})
        })
    }
    Catalogo_usuarios(solicitud){
        return new Promise((resolve, reject)=>{
            let JOIN = `JOIN Perfiles as p  on p.IdPerfil = u.IdPerfil`;
            mysql.ejecutar(`SELECT * FROM Usuarios as u ${JOIN} ;`).then((res)=>{
                return resolve({Data: res, error: false});
            }).catch(err=>{ console.log('error',err); reject(err);})
        })
    }
    Catalogo_puestos(solicitud){
        return new Promise((resolve, reject)=>{
            mysql.ejecutar('SELECT * FROM Perfiles;').then((res)=>{
                return resolve({Data: res, error: false});
            }).catch(err=>{ console.log('error',err); reject(err);})
        })
    }
    
    Catalogo_cotizaciones(solicitud){
        return new Promise((resolve, reject)=>{
            mysql.ejecutar('SELECT * FROM Cotizaciones;').then((res)=>{
                return resolve({Data: res, error: false});
            }).catch(err=>{ console.log('error',err); reject(err);})
        })
    }
    Catalogo_cuentas(solicitud){
        return new Promise((resolve, reject)=>{
            mysql.ejecutar('SELECT * FROM Cuentas_especiales;').then((res)=>{
                return resolve({Data: res, error: false});
            }).catch(err=>{ console.log('error',err); reject(err);})
        })
    }
    obtener_prospectos_ventas(datos){
        return new Promise((resolve, reject)=>{
            let condiciones = ` IdUsuario = ${datos.IdUsuario} `;
            mysql.ejecutar(`SELECT * FROM Prospectos_ventas WHERE ${condiciones}; `).then((res)=>{
                return resolve({Data: res, error: false});
            }).catch(err=>{ console.log('error',err); reject(err);})
        })
    }
    actualizar_prospectos_ventas(datos){
        return new Promise((resolve, reject)=>{
            console.log('datos',datos);
            let update = ` Fecha_modificacion = '${moment().format('YYYY-MM-DD HH:mm:ss')}' `;
            update += (datos.Comentarios)?` Comentarios = '${datos.Comentarios}',`:``;
            update += (datos.Resolucion)?` Resolucion = ${datos.Resolucion},`:``;
            update += (datos.Activo || datos.Activo == 0)?` Activo = ${datos.Activo},`:``;
            update = update.slice(0,-1);
            mysql.ejecutar(`UPDATE Prospectos_ventas SET ${update} WHERE IdProspecto = ${datos.IdProspecto} ; `).then((res)=>{
                return resolve({Procesado: true, Operacion: 'La solicitud del prospecto fue actualizada exitosamente ', Tipo: 'success'});
            }).catch(err => { console.log('err',err); return reject({Data: false, err })});
        });        
    }
    guardar_prospectos_ventas(datos){
        console.log('datos',datos);
        return new Promise((resolve, reject)=>{
            let today = moment().format('YYYY-MM-DD HH:mm:ss');
            let campos = `IdUsuario, Nombre_prospecto, Descripcion, Telefono,Correo, Fecha, Fecha_modificacion`;
            let valores = `${datos.IdUsuario},'${datos.Nombre_prospecto}','${datos.Descripcion}','${datos.Telefono}','${datos.Correo}','${today}','${today}'`;
            mysql.ejecutar(`INSERT INTO Prospectos_ventas (${campos}) VALUES (${valores})`).then((res)=>{
                return resolve({Data: res, error: false});
            }).catch(err=>{ console.log('error',err); reject(err);})
        })
    }
    borrar_prospectos_ventas(datos){
        return new Promise((resolve, reject)=>{
            console.log('datos',datos);
            mysql.ejecutar(`DELETE FROM Prospectos_ventas WHERE IdProspecto = ${datos.IdProspecto}`).then((res)=>{
                return resolve({Procesado: true, Operacion: 'El prospecto fue eliminada correctamente', Tipo: 'success'});
            }).catch(err => { console.log('err',err); return reject({Data: false, err })});
        });
    }
    Guardar_nueva_cuenta_especial(datosCuenta){
        console.log('datos',datosCuenta);
        return new Promise((resolve, reject)=>{
            let campos = `Nombre, Numero, Saldo, Activa`;
            let valores = `'${datosCuenta.Nombre}','${datosCuenta.Numero}',${datosCuenta.Saldo},1`;
            mysql.ejecutar(`INSERT INTO Cuentas_especiales (${campos}) VALUES (${valores})`).then((res)=>{
                return resolve({Data: res, error: false});
            }).catch(err=>{ console.log('error',err); reject(err);})
        })
    }
    Actualizar_cuenta_especial(datos){
        return new Promise((resolve, reject)=>{            
            let update = (datos.Activa || datos.Nombre || datos.Saldo || datos.Numero)?`SET`:``;
            update += (datos.Activa || datos.Activa == '0')?` Activa = ${datos.Activa},`:``;
            update += (datos.Nombre)?` Nombre = '${datos.Nombre}',`:``;
            update += (datos.Saldo)?` Saldo = ${datos.Saldo.split('$').join('').split(',').join('')},`:``;
            update += (datos.Numero)?` Numero = ${datos.Numero},`:``;
            update = update.slice(0,-1);
            mysql.ejecutar(`UPDATE Cuentas_especiales ${update} WHERE IdCuenta= ${datos.IdCuenta};`).then((res)=>{
                return resolve({Procesado: true, Operacion: 'Los Datos de la cuenta fueron cambiados exitosamente ', Tipo: 'success'});
            }).catch(err => { console.log('err',err); return reject({Data: false, err })});
        });
    }
    Actualizar_datos_categorias(datos){
        return new Promise((resolve, reject)=>{
            let update = (datos.Categoria)?`SET`:``;
            update += (datos.Categoria)?` Categoria = '${datos.Categoria}',`:``;
            update += (datos.IdPadre)?` IdPadre = ${datos.IdPadre},`:``;
            update = update.slice(0,-1);
            mysql.ejecutar(`UPDATE Catalogo_gastos ${update} WHERE IdCategoria= ${datos.IdCategoria};`).then((res)=>{
                return resolve({Procesado: true, Operacion: 'Los Datos de la categoria fueron cambiados exitosamente ', Tipo: 'success'});
            }).catch(err => { console.log('err',err); return reject({Data: false, err })});
        });
    }
    Guardar_nueva_categoria(datos){
        return new Promise((resolve, reject)=>{
            console.log('datos',datos);
            let campos = `Categoria,IdPadre`;
            let valores = `'${datos.Categoria}',${(datos.IdPadre)?datos.IdPadre:0}`;
            mysql.ejecutar(`INSERT INTO Catalogo_gastos(${campos}) VALUES (${valores});`).then((res)=>{
                return resolve({Procesado: true, Operacion: 'Los datos han sido agregados exitosamente ', Tipo: 'success'});
            }).catch(err => { console.log('err',err); return reject({Data: false, err })});
        });
    }
    Borrar_categoria(datos){
        return new Promise((resolve, reject)=>{
            console.log('datos',datos);
            let idCategoria = datos.IdCategoria;
            mysql.ejecutar(`DELETE FROM Catalogo_gastos WHERE IdCategoria = ${idCategoria}`).then((res)=>{
                return resolve({Procesado: true, Operacion: 'La categoria fue eliminada correctamente', Tipo: 'success'});
            }).catch(err => { console.log('err',err); return reject({Data: false, err })});
        });
    }
    Borrar_cuenta_especial(Id){
        return new Promise((resolve, reject)=>{
            mysql.ejecutar(`DELETE FROM Cuentas_especiales WHERE IdCuenta= ${Id};`).then((res)=>{
                return resolve({Eliminado: true});
            }).catch(err => { console.log('err',err); return reject({Data: false, err })});
        });
    }
    Obtener_terreno_por_id(Id){
        return new Promise((resolve, reject)=>{
            mysql.ejecutar(`SELECT * FROM Terrenos WHERE IdTerreno = ${Id} LIMIt 1;`).then((res)=>{
                return resolve({Data: res, error: false});
            }).catch(err=>{ console.log('error',err); reject(err);})
        })
    }
    Obtener_terrenos(datos){
        return new Promise((resolve, reject)=>{
            mysql.ejecutar(`SELECT * FROM Terrenos;`).then((res)=>{
                return resolve({Data: res, error: false});
            }).catch(err=>{ console.log('error',err); reject(err);})
        })
    }
    Obtener_datos_contrato(datos){
        return new Promise((resolve, reject)=>{
            if(datos.datosTerreno.IdTerreno){
                let ruta_archivo = `./shared/uploads/${datos.datosCliente.Nombre}/`;
                let nombre_archivo =  `Contrato-parcela_${datos.datosTerreno.parcela}-lote_${datos.datosTerreno.lote}-etapa_${datos.datosTerreno.etapa}.html`;
                let file = `${ruta_archivo}${nombre_archivo}`;
                if(fs.existsSync(file)){
                    fs.readFile(file,'utf8' ,(err, data) => {
                        if(err) {
                          return resolve({Data: false, err });
                        } else {
                          return resolve({Data: data, err });
                        }
                      });
                }else{
                    return resolve({Data: this._contenidoContratoGenerico(datos) });
                }
            }else{
                return reject({Data: false, err });                    
            }
        })
    }
    Actualizar_cliente(datos){
        return new Promise((resolve, reject)=>{
            console.log('datos',datos);
            let datos_update = `Nombre = '${datos.Nombre}', Correo = '${datos.Correo}', Num_ife = '${datos.Num_ife}', Origen= '${datos.Origen}', Telefono = '${datos.Telefono}', Fecha_nacimiento = '${datos.Fecha_nacimiento}', Direccion =  '${datos.Direccion}' `;
            let condiciones = `IdCliente = ${datos.IdCliente}`;
            console.log('datos update',`UPDATE Clientes SET ${datos_update} WHERE ${condiciones};`);

            mysql.ejecutar(`UPDATE Clientes SET ${datos_update} WHERE ${condiciones};`).then((res)=>{
                console.log('res',res);
                return resolve({Procesado: true, Operacion: 'Los Datos del Cliente fueron cambiados exitosamente ', Tipo: 'success'});
            }).catch(err => { console.log('err',err); return reject({Data: false, err }); });
        })
    }
    Actualizar_mantenimiento(datos){
        return new Promise((resolve, reject)=>{
            let datos_update = `SET Dia_mantenimiento = ${datos.Dia} , Importe_mantenimiento = ${datos.Importe}`;
            let condiciones = `IdTerreno = ${datos.IdTerreno} AND IdCliente = ${datos.IdCliente}`;
            mysql.ejecutar(`UPDATE Clientes_terrenos ${datos_update} WHERE ${condiciones};`).then((res)=>{
                return resolve({Procesado: true, Operacion: 'Los Datos del mantenimiento fueron cambiados exitosamente ', Tipo: 'success'});
            }).catch(err => {Data: false, err });
        })
    }
    Guardar_tipo_documento(datos){
        return new Promise((resolve, reject)=>{
            let today =  moment(new Date()).format('YYYY-MM-DD');
            let campos =  `Nombre,Fecha_insercion`;
            let valores = `'${datos.Nombre}','${today}'`;
            mysql.ejecutar(`INSERT INTO Documentos_tipos (${campos}) VALUES (${valores});`).then((res)=>{
                return resolve({Procesado: true, Operacion: 'El nuevo documento fue guardado  correctamente', Tipo: 'success'});
            }).catch(err => { console.log('err',err); return reject({Data: false, err })});
        });
    }
    Guardar_nuevo_empleado(datos){
        return new Promise((resolve, reject)=>{
            let today =  moment(new Date()).format('YYYY-MM-DD');
            let campos =  `Nombre,Correo,Sueldo,Fecha_nacimiento,Fecha_registro,Puesto`;
            let valores = `'${datos.Nombre}','${datos.Correo}','${datos.Sueldo}','${datos.Fecha_nacimiento}','${today}','${datos.Puesto}'`;
            mysql.ejecutar(`INSERT INTO Empleados (${campos}) VALUES (${valores});`).then((res)=>{
                return resolve({Procesado: true, Operacion: 'El nuevo empleado fue guardado correctamente', Tipo: 'success'});
            }).catch(err => { console.log('err',err); return reject({Data: false, err })});
        });
    }
    Guardar_nomina_empleado(datos){
        console.log('datos',datos);
        return new Promise((resolve, reject)=>{
            let today =  moment().format('YYYY-MM-DD HH:mm:ss');
            let campos =  `IdEmpleado, IdUsuario, Nombre_empleado, Fecha_nomina, Horas_laboradas, Comisiones, Sueldo, Bonos, Descuentos, Descuentos_totales, Total, Fecha_insercion`;
            let valores = `${datos.Nomina.IdEmpleado},${datos.Usuario.Datos.IdUsuario},'${datos.Nomina.Nombre}','${moment().format('YYYY-MM-DD')}',${datos.Nomina.Horas},${datos.Nomina.Comisiones}, ${datos.Nomina.Sueldo},${datos.Nomina.Bonos},${datos.Nomina.Descuentos},${datos.Nomina.Descuentos_totales},${datos.Nomina.Total},'${today}'`;
            console.log('valores',valores);
            mysql.ejecutar(`INSERT INTO Nominas (${campos}) VALUES (${valores});`).then((res)=>{
                return resolve({Procesado: true, Operacion: 'La Nomina fue guardada correctamente ', Tipo: 'success'});
            }).catch(err => { console.log('err',err); return reject({Data: false, err })});
        });
    }
    Desasignar_cotizacion(obj){
        return new Promise((resolve, reject)=>{
            mysql.ejecutar(`UPDATE Cotizaciones Set Activa = 0 WHERE IdCotizacion = ${obj.IdCotizacion};`).then((res)=>{
                return resolve({Procesado: true, Operacion: 'La cotizacion fue desasignada correctamente', Tipo: 'success'});
            }).catch(err => { console.log('err',err); return reject({Data: false, err })});
        });
    }
    Activar_cotizacion(obj){
        return new Promise((resolve, reject)=>{
            mysql.ejecutar(`UPDATE Cotizaciones Set Activa = 1 WHERE IdCotizacion = ${obj.IdCotizacion};`).then((res)=>{
                return resolve({Procesado: true, Operacion: 'La cotizacion fue activada correctamente', Tipo: 'success'});
            }).catch(err => { console.log('err',err); return reject({Data: false, err })});
        });
    }
    subir_excel_terrenos(datos_archivo){
        //console.log('datos',datos_archivo);
        return new Promise((resolve, reject)=>{
            let datos = new Buffer(datos_archivo.file, "base64");
            let path = `./shared/uploads/Catalogos/`;
            let fileName = `Catalogo_terrenos${moment().format('YYYY-MM-DD_HH:mm:ss')}.xlsx`;
            return this._guardarArchivoDirectorio(path,fileName,datos,2097152,'base64').then(fullPath=>{
                //LEE EL ARCHIVO DE EXCEL Y LO TRANSFORMA EN UN OBJETO
                let workbook = new Excel.Workbook();
                return workbook.xlsx.readFile(fullPath);
            }).then((datosExcel) => {
                //ORGANIZA LOS DATOS DEL EXCEL PARA TENER DATOS ORDENADOS POR CABECERA
                let datosHoja1 = datosExcel.getWorksheet(1);
                //console.log('datosHoja1',datosHoja1);
                return this._organizarDatosTerrenos(datosHoja1);
            }).then(datosFinal=>{
                console.log('terminado',datosFinal);
                //return resolve(res);
                this.Guardar_varios_terrenos(datosFinal);
            }).then(res=>{
                console.log('terminado',res);
                //return resolve(res);
                return resolve({Procesado: true, Operacion: 'Terrenos guardados correctamente', Tipo: 'success'});
            }).catch(err=>{
                console.log('err',err);
                return reject(err);
            })
        });
    }
    _organizarDatosTerrenos(datos){
        return new Promise((resolve, reject) => {
            let datosOrdenados = [];
            //CONVERTIMOS LA HOJA EN UN ARRAY BIDIMENCIONAL
            datos.eachRow({ includeEmpty: true },(row, rowNumber) => {
                let columnas = [];
                row.eachCell({ includeEmpty: true }, function(cell, colNumber) {
                    columnas.push(cell.value);
                });
                datosOrdenados.push(columnas);
            });
            //console.log('datosOrdenados',datosOrdenados);
            let llaves = [];
            datosOrdenados[0].forEach(d=>{
                if(d != null){
                    let limpiar = " ,.,:,(,),/,".split(',');
                    let llave_limpia = `${d}`.split('í').join('i').split('ó').join('o').split('á').join('a').split('ú').join('u').split('é').join('e').split(' ').join('_').replace('%','PORCENTAJE').replace('$','MONEDA');
                    llave_limpia = this._enMayusculas(llave_limpia,true);
                    limpiar.forEach(l=>{
                        llave_limpia = llave_limpia.split(`${l}`).join('');
                    });
                    llaves.push(llave_limpia);
                }
            });
            datosOrdenados.shift();
            //ASIGNAMOS EL OBJETO ORDENADO POR LAS CABECERAS A LOS DATOS ORDENADOS
            let datosProcesados = [];
            datosOrdenados.forEach(d=>{
                let filaVacia = true;
                let str = `{`;
                for(let i=0;i < llaves.length;i++){
                    if(d[i]){filaVacia = false ;}
                    let valor = `${(!d[i])?'-':`${d[i]}`}`;
/*                    if(`${llaves[i]}`.indexOf('FECHA') > -1 && valor){
                        let fch = new Date(valor.toString().trim()); 
                        valor = moment(new Date(fch.setHours(fch.getHours() + 7))).format('YYYY-MM-DD');
                    }*/
                    valor = valor.toString().split('\r\n'); valor=String(valor).replace('\t','');
                    str += `"${llaves[i]}":"${valor.toString().trim()}",`;
                }
                str += `"ACTIVO":"1","ASIGNADO":"0",`;
                str = (str.indexOf(',') > -1 )?str.slice(0,-1):str;
                str += `}`;
                if(!filaVacia){
                    datosProcesados.push(JSON.parse(str));
                }
            });
            return resolve(datosProcesados);
        });
    }
    _enMayusculas(dato, forzar){
        if(forzar && dato != null){
            return dato.toString().toUpperCase();
        }
    return dato;
    }
    Actualizar_terreno(datos){
        console.log('datos',datos);
        return new Promise((resolve, reject)=>{            
            let update = (datos.Lote || datos.Parcela || datos.Etapa || datos.Superficie)?`SET`:``;
            update += (datos.Lote )?` lote = '${datos.Lote}',`:``;
            update += (datos.Etapa )?` etapa = '${datos.Etapa}',`:``;
            update += (datos.Parcela )?` parcela = '${datos.Parcela}',`:``;
            update += (datos.Superficie )?` superficie = '${datos.Superficie}',`:``;
            update += (datos.Pertenece )?` Pertenece = '${datos.Pertenece}',`:``;
            update += (datos.Estado )?` Estado = '${datos.Estado}',`:``;
            update += (!datos.Asignado || datos.Asignado == 0 )?` Asignado = 0,`:(datos.Asignado)?` Asignado = 1,`:'';
            update += (!datos.Activo || datos.Activo == 0 )?` Activo = 0,`:(datos.Activo)?` Activo = 1,`:'';
            update = update.slice(0,-1);
            console.log(`UPDATE Terrenos ${update} WHERE IdTerreno= ${datos.IdTerreno};`);
            mysql.ejecutar(`UPDATE Terrenos ${update} WHERE IdTerreno= ${datos.IdTerreno};`).then((res)=>{
                return resolve({Procesado: true, Operacion: 'Los Datos del terreno fueron cambiados exitosamente ', Tipo: 'success'});
            }).catch(err => { console.log('err',err); return reject({Data: false, err })});
        });
    }
    Borrar_terreno(datos){
        return new Promise((resolve, reject)=>{
            console.log('datos',datos);
            let IdTerreno = datos.IdTerreno;
            mysql.ejecutar(`DELETE FROM Terrenos WHERE IdTerreno = ${IdTerreno}`).then((res)=>{
                return resolve({Procesado: true, Operacion: 'El terreno fue eliminado correctamente', Tipo: 'success'});
            }).catch(err => { console.log('err',err); return reject({Data: false, err })});
        });
    }
    Borrar_terrenos_multiples(datos){
        console.log('datos',datos);
        return new Promise((resolve, reject)=>{
            return mysql.ejecutar(`DELETE FROM Terrenos WHERE IdTerreno IN (${datos.Ids});`).then((res)=>{
                return resolve({Eliminado: true});
            }).catch(err => { console.log('err',err); return reject({Data: false, err })});
        });
    }
    Obtener_plantilla_terrenos(datos){
        return new Promise((resolve, reject) => {
            let path = `./shared/Plantillas/Plantilla_terrenos.xlsx`;
            let cont = fs.readFileSync(path);
            return resolve({String:cont.toString('base64')});
        });
    }
    Obtener_plantilla_gastos(datos){
        return new Promise((resolve, reject) => {
            let path = `./shared/Plantillas/Plantilla_gastos.xlsx`;
            let cont = fs.readFileSync(path);
            return resolve({String:cont.toString('base64')});
        });
    }
    Guardar_varios_terrenos(datos){
        return new Promise((resolve, reject)=>{
            let Promesas = [];
            var mysql = require('mysql');
            var conexion = mysql.createConnection({
                host     : 'localhost',
                user     : 'root',
                password : 'Sakaunperikin24*',
                database : 'ElRetiro',
                acquireTimeout: 100000000000000000
              });
            conexion.connect();
            datos.forEach(d=>{
                console.log('d',d);
                let campos = `parcela, etapa, lote, Pertenece, Superficie, Asignado, Activo`;
                let valores = `'${d.PARCELA}','${d.ETAPA}','${d.LOTE}','${d.PERTENECE}',${d.SUPERFICIE},${d.ASIGNADO},${d.ACTIVO}`;
                Promesas.push(this._ordenarQuery(conexion,`INSERT INTO Terrenos(${campos}) VALUES(${valores})`));
            })
           Promesas.reduce((PP, current) => {
            return PP.then(results => {
                return current.then(currentResult => {
                    return Promise.resolve({Procesado:true,Res:currentResult});
                }).catch(e => {
                    return Promise.resolve({Procesado:false,Res:e});
                })
            })
            }, Promise.resolve([])).then(r => {
                return resolve(r);
            }).catch(err=>{console.log('err',err); return reject(err); });
        });        
    }
    modificar_datos_todos(datos){
        return new Promise((resolve, reject)=>{
            let str = ` SET `;
            datos.Datos.forEach(d=>{
                str += (d.llave != 'Id' && d.llave != 'Obj' && d.llave != 'Cotizacion' && d.llave != 'ObjCompleto' && d.llave != 'ACTIVO' )?'`'+`${d.llave}`+'`'+`='${d.valor}',`:``;
            })
            str = (str.indexOf(',') > -1 )?str.slice(0,-1):str;
            //console.log('str',str);
            //console.log('query',`UPDATE Datos_todos ${str} WHERE Id= ${datos.Id};`);
            mysql.ejecutar(`UPDATE Datos_todos ${str} WHERE Id= ${datos.Id};`).then((res)=>{
                //console.log('res',res);
                return resolve({Procesado: true, Operacion: 'Los Datos de la cuenta fueron cambiados exitosamente ', Tipo: 'success'});
            }).catch(err => { console.log('err',err); return reject({Data: false, err })});
        });
    }    
    borrar_registro_datos_todos(datos){
        return new Promise((resolve, reject)=>{
            let ids =  ``;
            datos.Ids.forEach(d=>{
                ids += `${d.Id},`;
            });
            ids = (ids.indexOf(',') > -1 )?ids.slice(0,-1):ids;            
            mysql.ejecutar(`UPDATE Datos_todos WHERE Id IN (${ids}); `).then((res)=>{
                console.log('res',res);
                return resolve({Procesado: true, Operacion: 'Los Datos de fueron eliminados correctamente; ', Tipo: 'success'});
            }).catch(err => { console.log('err',err); return reject({Data: false, err })});
        });
    }
    Catalogo_datos(data){
//        console.log('datos',data);
        return new Promise((resolve, reject)=>{
            let condiciones = ` ACTIVO = 1 AND `+"`"+`NOMBRE DEL CLIENTE`+"`"+` NOT LIKE '%DUARTE%MEDRANO%' AND  `+"`"+`NOMBRE DEL CLIENTE`+"`"+` NOT LIKE '%DUARTE%PRECIADO%' AND  `+"`"+`NOMBRE DEL CLIENTE`+"`"+` NOT LIKE '%MEDRANDO%' AND  `+"`"+`NOMBRE DEL CLIENTE`+"`"+` NOT LIKE '%MEDRANO%NEVAREZ%' `;
            return mysql.ejecutar(`SELECT * from Datos_todos WHERE ${condiciones}`).then((res)=>{
                return resolve({Datos:res});
            }).catch(err => { console.log('err',err); return reject({Data: false, err })});
        });        
    }
    _ordenarQuery(conexion, query){
        return new Promise((resolve, reject) => {
            console.log('query',query);
            conexion.query(query, (error, results)=>{
                if(results){
                    let datosOrdenados = [];
                    if(results.length > 0){
                        let datosOrenados =  [];
                        results.forEach(r=>{
                            datosOrenados.push(r);
                        })
                        return resolve(JSON.parse(JSON.stringify(datosOrenados)));
                    }else{
                        return resolve(false);
                    }
                }else if(error){
                    return reject(error);
                }else{
                    return reject({errorMessage: 'Error en la consulta'});
                }
            });
        });
     }
    //Almacena un archivo en un directorio epecifico segun los parametros enviados
    _guardarArchivoDirectorio(path,nombre,datos,maxSize=false, encode=false){
        return new Promise((resolve, reject) => {
            //Si supera el max size regresa un reject
            if(maxSize){
                let encoding = (encode)?encode:false;
                let size = Buffer.byteLength(datos,encoding);
                if (size > maxSize) { return reject(`Archivo adjunto no debe pesar mas de ${maxSize/1048576} MB`);}
            }
            //Si no existe el directorio se crea
            (!fs.existsSync(path))?fs.mkdirpSync(path):'';
            //Fullpath
            let fullPath = `${path}${nombre}`;
            //Se escribe el archivo
            fs.writeFile(fullPath, datos,(err= true)=>{
                if(err){return reject(err)}else{resolve(fullPath);}
            });
        }).then((pathFinal) =>{
            return pathFinal;
        }).catch((error)=>{
            return error;
        });
    }
    envio_correo_contacto(datos){
        console.log('Datos',datos);
        return new Promise((resolve, reject) => {
            if(`${datos.Correo}`.indexOf('@') > -1 && datos.Nombre != ''  && datos.Mensaje != ''){
                const nodemailer = require('nodemailer');
                let usr = 'contacto.campestreelretiro@gmail.com';
                let pas = `Retiro87`;
                let Contenido = `Contacto desde el sitio web <br> <b>De:</b> ${datos.Nombre} <br><b>Correo:</b> ${datos.Correo} <br> <b>Mensaje:</b> <br>${datos.Mensaje}`;
                nodemailer.createTestAccount((err, account) => {
                    var transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: usr, pass: pas} });
                    //`campestreretiro@gmail.com, bocho_sup@hotmail.com`
                    let mailOptions = { from: usr ,to: `campestreretiro@gmail.com,luisfernandocordova.24@gmail.com`, subject: `Contacto Web`, html: `${Contenido}` };
                    transporter.sendMail(mailOptions, (error, info) => {
                        let respuesta = {Procesado: false, Operacion: 'Fallo el envio de correo', Tipo: 'error',Error: error};
                        if (error) { return reject(respuesta); }
                        return resolve({Procesado: true, Operacion: 'Correo Enviado Correctamente', Tipo: 'success'});
                        //console.log('Message sent: %s', info.messageId); console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
                    });
                });
            }
        });
     }
    _contenidoContratoGenerico(datosContrato){
        return  `<div class="row" style="padding:20px;">
        <div class="col-lg-12">
            <h3>CONTRATO DE PROMESA DE COMPRA VENTA</h3>
            <p>
                EN LA CIUDAD DE HERMOSILLO SONORA SIENDO LAS 10:00 HORAS DEL DIA 02 DE  AGOSTO  DE 2017   CELEBRAN: POR UNA PARTE LA C. LIDIA ALEJANDRA DUARTE MEDRANO   QUIEN BAJO PROTESTA DE DECIR VERDAD CELEBRA ESTE CONTRATO COMO POSESIONARIA  DEL POBLADO EL CARMEN MUNICIPIO DE HERMOSILLO COMO PROMITENTE VENDEDOR.
                POR UNA SEGUNDA PARTE COMPARECE EL C. &nbsp;&nbsp;<b><u>${datosContrato.datosCliente.Nombre}</u></b> &nbsp;&nbsp;  QUIEN EN LO SUCESIVO SE LE DENOMINARA PROMITENTE COMPRADOR.
                MANIFESTARON QUE TIENEN CONCERTADO UN CONTRATO DE PROMESA DE COMPRAVENTA MISMO QUE DEJAN FORMALIZADO AL TENOR DE LOS ANTECEDENTES, DECLARACIONES Y CLAUSULAS SIGUIENTES:
            </p>
            <h3>ANTECEDENTES </h3>
            <p>
                <b>PRIMERO.-</b>
                EL EJIDO EL CARMEN MUNICIPIO DE HERMOSILLO ESTADO DE SONORA CUENTA CON RESOLUCION PRESIDENCIAL DE FECHA 29 DE JULIO DE 1936, EJECUTÁNDOSE  TOTALMENTE  EL DIA   29 / 07 /  36 POR LA VIA DOTACIÓN  CON UNA  SUPERFICIE DE  718-00-00  HAS , PARA   22   EJIDATARIOS.- 
            </p>
            <p>
                <b>SEGUNDO:</b>
                POSTERIORMENTE CON EL PROGRAMA DE CERTIFICACION DE DERECHOS EJIDALES Y TITULACION DE SOLARES URBANOS SE LLEVO A CABO LA REGULARIZACION DE LA TENENCIA DE LA TIERRA CULMINANDO LA ASAMBLEA DE DELIMITACION. DESTINO, ASIGNACION CON FECHA 29 DE NOVIEMBRE DE 1997, RATIFICÁNDOSE A 22   EJIDATARIOS.-
            </p>
            <p>
                <b>TERCERO:</b>
                ACTO SEGUIDO SE CELEBRA AUTORIZACION PARA ADOPCION DE DOMINIO PLENO SOBRE TIERRAS PARCELADAS  ASAMBLEA  CELEBRADA CON FECHA  01 DE AGOSTO DE 1999, INSCRITO EL ACTO EN EL REGISTRO AGRARIO NACIONAL CON FECHA  21 DE SEPTIEMBRE DEL AÑO 2000.- 
            </p>
            <p>
                <b>CUARTA:</b>
                QUE CON FECHA 25  DE OCTUBRE  DE 2014 EN ASAMBLEA DE DELIMITACION, DESTINO Y ASIGNACION DE TIERRAS ( CERTIFICACION DE LA TIERRA INCORPORADA AL REGIMEN EJIDAL COMO AREA PARCELADA)  SE FORMALIZO LA CERTIFICACION DE LA MISMA CORRESPONDIENDOLE A LA LIDIA ALEJANDRA DUARTE MEDRANO  UNA PARCELA CON EL NUMERO ${datosContrato.datosTerreno.parcela} .-
            </p>
            <br>

            <h3>DECLARACIONES</h3>                    
            <p>
                <b>PRIMERA:</b>
                LA C. LIDIA ALEJANDRA DUARTE MEDRANO  DECLARA QUE ES TITULAR DE LA PARCELA  N°  ${datosContrato.datosTerreno.parcela} CON SUPERFICIE DE ${datosContrato.datosTerreno.Superficie} MTS. 2  UBICADO EN EL EJIDO EL CARMEN MUNICIPIO DE HERMOSILLO Y QUE SE LOCALIZA EN EL CONJUNTO “CAMPESTRE FAMILIAR EL RETIRO”, EN EL KILOMETRO 15.0 DE LA CARRETERA A SAN MIGUEL DE HORCASITAS. 
            </p>                    
            
            <h3 class="text-right">HOJA NO.02 </h3>
            <p>
                <b>SEGUNDA:</b>
                LA C. LIDIA ALEJANDRA DUARTE MEDRANO, ACREDITA LA TITULARIDAD DE LA PARCELA NUMERO  ${datosContrato.datosTerreno.parcela}  CON SUPERFICIE ${datosContrato.datosTerreno.Superficie} MTS. CON CERTIFICADO PARCELARIO NÚMERO&nbsp;&nbsp;<b><u>${datosContrato.datosTerreno.parcela}</u></b> &nbsp;&nbsp; Y FOLIO: &nbsp;&nbsp;<b><u>${datosContrato.datosCliente.NumIfe}</u></b> &nbsp;&nbsp; EXPEDIDO  POR EL REGISTRO AGRARIO NACIONAL .
                <br>
                LAS PARTES DE COMUN ACUERDO SE SUJETAN A LAS CLAUSULAS SIGUIENTES:
            </p>
            <h3 class="text-center">CLÁUSULAS </h3>
            <p>
                <b>PRIMERA:</b>
                LA C. LIDIA ALEJANDRA DUARTE MEDRANO  ESTA FORMALIZANDO CONTRATO DE PROMESA DE COMPRAVENTA CON EL (LA) C.&nbsp;&nbsp;<b><u>${datosContrato.datosCliente.Nombre}</u></b> &nbsp;&nbsp;  RESPECTO DE LA PARCELA NUMERO &nbsp;&nbsp;<b><u>${datosContrato.datosTerreno.parcela}</u></b> &nbsp;&nbsp; QUE SE UBICA EN EL EJIDO EL CARMEN MUNICIPIO DE HERMOSILLO Y SE LOCALIZA DENTRO DEL CONJUNTO “CAMPESTRE FAMILIAR EL RETIRO”, EN EL KILOMETRO 15.0 DE LA CARRETERA A SAN MIGUEL DE HORCASITAS. 
            </p>
            <p>
                <b>SEGUNDA:</b>
                DESDE ESTE MOMENTO SEÑALAN LAS PARTES CONTRATANTES LA OBLIGACION DE LA PARTE PROMITENTE COMPRADORA DE PAGAR LA CANTIDAD DE $ 125,000.00  ( CIENTO VEINTICINCO MIL  PESOS  )   POR UNA SUPERFICIE DE  ${datosContrato.datosTerreno.Superficie} MTS. 2  
                <br>
                DICHA CANTIDAD SE CUBRIRA DE LA SIGUIENTE FORMA: PAGO INMEDIATO A LA FIRMA DE ESTE CONTRATO .
            </p>
            <p>
                <b>TERCERA:</b>
                SI POR ALGUNA RAZON EL(LA) C.&nbsp;&nbsp;<b><u>${datosContrato.datosCliente.Nombre}</u></b> &nbsp;&nbsp; QUISIERE TRASPASAR O CEDER LA PARCELA NUMERO ${datosContrato.datosTerreno.parcela} , SE TENDRA QUE DAR PREVIO AVISO POR ESCRITO A LA C.LIDIA ALEJANDRA DUARTE MEDRANO , PARA QUE UNA VEZ CONCLUIDO EL PAGO TOTAL  SE TENGAN LOS DATOS ACUALIZADOS Y REALIZAR LA CESION DE DERECHOS A FAVOR DE LA PARTE PROMITENTE COMPRADORA Y O BIEN A QUIEN ESTA PERSONA ELIJA POR ASI CONVENIR A SUS INTERESES.-                        
            </p>
            <p>
                <b>CUARTA:</b>
                LA C. LIDIA ALEJANDRA DUARTE MEDRANO  MANIFIESTA ESTAR REALIZANDO Y FORMALIZANDO ESTE CONTRATO DE PROMESA DE COMPRA-VENTA CON EL (LA)C. &nbsp;&nbsp;<b><u>${datosContrato.datosCliente.Nombre}</u></b> &nbsp;&nbsp; EL CUAL CULMINA EN CONVENIO DE CESION DE DERECHOS  A FAVOR DEL( DE LA )  C. &nbsp;&nbsp;<b><u>${datosContrato.datosCliente.Nombre}</u></b> &nbsp;&nbsp; NO TENIENDO NINGÚN INCONVENIENTE  LA C. LIDIA ALEJANDRA DUARTE MEDRANO  QUE EL CERTIFICADO PARCELARIO CORRESPONDIENTE SEA A NOMBRE DE LA PERSONA ANTES MENCIONADA,O A QUIEN ESTA SEÑALE  QUIEN SE HARÁ RESPONSABLE DE LOS PAGOS Y COSTOS DEL TRASLADO  ANTE LA DEPENDENCIA QUE CORRESPONDE .                        
            </p>
            <h3 class="text-right">HOJA NO.03 </h3>
            <p>
                <b>QUINTA:</b>
                CONVIENEN AMBAS PARTES QUE EL(LA) C. &nbsp;&nbsp;<b><u>${datosContrato.datosCliente.Nombre}</u></b> &nbsp;&nbsp; PAGARÁ EL CONTRATO DE AGUA A LA C. LIDIA ALEJANDRA DUARTE MEDRANO   UNA VEZ INSTALADA LA TOMA DE AGUA EN SU TERRENO, EL(LA)  C.&nbsp;&nbsp;<b><u>${datosContrato.datosCliente.Nombre}</u></b> &nbsp;&nbsp; SOLO UTILIZARA ESTE SERVICIO DE SUMINISTRO DE AGUA EN LA PARCELA  YA ESPECIFICADA, HACIENDO UN USO ADECUADO DEL AGUA PARA EL CONSUMO MODERADO DE LAS NECESIDADES QUE REQUIERE UN TERRENO CAMPESTRE DENTRO DE LAS INSTALACIONES DE CAMPESTRE FAMILIAR “ EL RETIRO ” , POR NINGUN MOTIVO SE PERMITIRA DESPLAZAR EL SUMINISTRO DE AGUA A OTRO LUGAR QUE NO SEA EL MENCIONADO EN ESTE CONTRATO, EN CASO CONTRARIO SE RACIONARA O SUSPENDERA DICHO SUMINISTRO , COBRANDOSE UNA CUOTA POR RECONECCION. EL PAGO DE CONTRATO DE AGUA SE REALIZARÁ EN LAS OFICINAS GENERALES A MÁS TARDAR 30 DÍAS DESPUÉS DE SU INSTALACIÓN, ASI COMO UN PAGO SEMESTRAL POR MANTENIMIENTO.
            </p>
            <p>
                <b>SEXTA:</b>
                LA PARTE PROMITENTE VENDEDORA SE OBLIGA AL SANEAMIENTO PARA EL CASO DE EVICCION EN FORMA Y CONFORME A DERECHO.
            </p>
            <p>
                <b>SEPTIMA:</b>
                LA C.LIDIA ALEJANDRA DUARTE MEDRANO  ENTREGA A LA CELEBRACION DEL PRESENTE INSTRUMENTO LA POSESIÓN FORMAL, MATERIAL Y JURIDICA DEL INMUEBLE DESCRITO EN LA DECLARACIÓNES DE ESTE CONTRATO DE PROMESA DE COMPRA-VENTA AL(A LA ) C. &nbsp;&nbsp;<b><u>${datosContrato.datosCliente.Nombre}</u></b> &nbsp;&nbsp; QUIEN EN ESTE MISMO ACTO LA RECIBE DE CONFORMIDAD.
            </p>
            <p>
                <b>OCTAVA:</b>
                PARA LA INTERPRETACIÓN Y CUMPLIMIENTO DE LO ESTIPULADO Y LO NO ESTIPULADO EN ESTE CONTRATO, LAS PARTES SE SOMETERÁN EXPRESAMENTE A LA JURISDICCIÓN DE LOS TRIBUNALES DEL DISTRITO JUDICIAL DE HERMOSILLO, SONORA; RENUNCIANDO PARA TAL FIN EL FUERO QUE LES CORRESPONDA ASÍ COMO EL DE SU DOMICILIO ACTUAL O FUTURO.
            </p>
            <p>
                <b>NOVENA:</b>
                MANIFIESTAN LAS PARTES PROMITENTE  VENDEDOR Y PROMITENTE COMPRADOR ESTAR DE ACUERDO EN OBLIGARSE A CELEBRAR UN CONTRATO DE CESION DE DERECHOS PARCELARIOS  UNA VEZ QUE SE HAYA CUBIERTO LA TOTALIDAD DE PAGO POR ENAJENACION  DEL  TOTAL DEL AREA  QUE SE ENAJENA, ACTUALMENTE PROPIEDAD DE LA C. LIDIA ALEJANDRA DUARTE MEDRANO  POSESIONARIA   DEL POBLADO   EL CARMEN    MUNICIPIO DE HERMOSILLO ESTADO DE SONORA,  OBLIGANDOSE LAS PARTES A RESPETAR LO ESTABLECIDO EN LA LEY AGRARIA EN VIGOR Y LA FACULTAD DE LA ASAMBLEA DEL RECONOCIMIENTO DEL PROMITENTE COMPRADOR CON CALIDAD DE POSESIONARIO .
            </p>
            <p>
                <b>DECIMA:</b>
                LO NO PREVISTO EN ESTE CONTRATO SE REGIRA POR LOS ARTICULOS 2474, 2475, 2476, 2477, 2478, 2479, 2481, 2482 Y DEMAS RELATIVOS Y APLICABLES AL CODIGO CIVIL PARA EL ESTADO DE SONORA.
            </p>
            <p>
                <b>DECIMA PRIMERA:</b>
                LA C. LIDIA ALEJANDRA DUARTE MEDRANO   PROMITENTE VENDEDOR MANIFIESTA QUE EN ESTA OCACION ESTA REALIZANDO Y FORMALIZANDO ESTE CONTRATO DE PROMESA DE COMPRAVENTA CON EL (LA)C. &nbsp;&nbsp;<b><u>${datosContrato.datosCliente.Nombre}</u></b> &nbsp;&nbsp; COMO PROMITENTE COMPRADOR QUE CULMINARA EN CONVENIO DE CESION DE DERECHOS PARCELARIOS A FAVOR DE EL(DE LA ) C.&nbsp;&nbsp;<b><u>${datosContrato.datosCliente.Nombre}</u></b> &nbsp;&nbsp; No TENIENDO NINGUN INCONVENIENTE LA C.LIDIA ALEJANDRA DUARTE MEDRANO QUE LA ENAJENACION CORRESPONDIENTE SEA A NOMBRE DEL ANTES SEÑALADO SIENDO LA PARTE PROMITENTE COMPRADORA QUIEN SE HARA RESPONSABLE DE LOS PAGOS Y COSTOS DEL TRASLADO ANTE LA DEPENDENCIA QUE CORRESPONDA, SIENDO IMPORTANTE SEÑALAR QUE SE DA EL CASO DE INEXISTENCIA DE LAS PARTES  POR EL CASO DE FALLECIMIENTO , LAS PARTES  QUE PARTICIPAN    SOLICITAN QUE  ESTE CONTRATO SEA RESPETADO EN TODOS SUS TERMINOS Y CONDICIONES DEBIENDO CULMINAR  A FAVOR DE QUIENES EN SU MOMENTO DEMUESTREN TENER DEREHO A ELLO CON ARREGLO A LA LEY .-
            </p>
            <h3 class="text-right">HOJA NO.04 </h3>
            <h3 class="text-center">PERSONALIDAD </h3>
            <p>
                LA C. LIDIA ALEJANDRA DUARTE MEDRANO  ACREDITO SU CARACTER DE  POSEISONARIA   DEL POBLADO EL CARMEN MUNICIPIO DE HERMOSILLO ESTADO DE SONORA CON RESOLUCION Y ACTA DE ASAMBLEA DE DELIMITACION, DESTINO Y   ASIGNACION DE TIERRAS CELEBRADA CON FECHA  25 DE  OCTUBRE  DE 2014   Y SU CORRESPONDIENTE   CERTIFICADPO PARCELARIO   , DOCUMENTOS QUE PASAN A FORMAR PARTE DE ESTE CONTRATO.
            </p>
            <h3 class="text-center">GENERALES DE LOS DECLARANTES</h3>
            <p class="text-center">
                    LA C.LIDIA ALEJANDRA DUARTE MEDRANO   MANIFESTO POR SUS GENERALES SER MEXICANO POR NACIMIENTO  E HIJA DE PADRES MEXICANOS , SOLTERA   POSESIONARIA   ORIGINARIO  DE    HERMOSILLO  ,  SONORA   , NACIDO  EL DÍA  06 DE AGOSTO DE 1990, QUIEN SE IDENTIFICO CON  CREDENCIAL DE ELECTOR FOLIO   &nbsp;&nbsp;<b><u>${datosContrato.datosCliente.NumIfe}</u></b> &nbsp;&nbsp; CON DOMICILIO CONOCIDO EJIDO EL ZACATON , MUNICIPIO DE HERMOSILLO .
                    <br>
                    EL (LA)C.&nbsp;&nbsp;<b><u>${datosContrato.datosCliente.Nombre}</u></b> &nbsp;&nbsp;  MANIFESTO POR SUS GENERALES SER MEXICANO POR NACIMIENTO E HIJO DE PADRES MEXICANOS ORIGINARIO DE: &nbsp;&nbsp;<b><u>${datosContrato.datosCliente.Origen}</u></b> &nbsp;&nbsp; NACIDO EL DIA &nbsp;&nbsp;<b><u>${datosContrato.datosCliente.Fecha_nacimiento}</u></b> &nbsp;&nbsp; IDENTIFICANDOSE CON CREDENCIAL DE ELECTOR FOLIO NUMERO &nbsp;&nbsp;<b><u>${datosContrato.datosCliente.NumIfe}</u></b> &nbsp;&nbsp;, CON DOMICILIO EN: &nbsp;&nbsp;<b><u>${datosContrato.datosCliente.Direccion}</u></b> &nbsp;&nbsp;.-
                    <br>
                    LEIDO QUE FUE EL PRESENTE CONTRATO POR LOS PARTICIPANTES LO RATIFICAN Y LO FIRMAN, MANIFESTANDO QUE EN LA CELEBRACION DEL MISMO NO EXISTE DOLO O VICIOS OCULTOS, ASI MISMO SEÑALA NO HABER SIDO COACCIONADOS DE MANERA ALGUNA PARA SU CELEBRACION, ARGUMENTANDO QUE EL PRESENTE DOCUMENTO ES LA REPRESENTACION ESCRITA DE SU VOLUNTAD, POR LO QUE LO FIRMAN DE CONFORMIDAD ABAJO.
                    <br><br>
                    A T E N T A M E N T E
                    POR LAS PARTES
                    <br>
                    _____________________________________________ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; _____________________________________________
                    <br>
                    C. LIDIA ALEJANDRA DUARTE MEDRANO          C.<br>
                    PROMITENTE VENDEDOR		                       PROMITENTE COMPRADOR
                    <br>
                    TESTIGOS
                    <br><br>
                    _____________________________________________  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; _____________________________________________
            </p>
        </div>
    </div>`;
    }
}