sap.ui.define([],
    function (){
        "use strict";   
    
        return {
             
            onPress: function(oEvent) {
            //     alert('onPress');
                   
            /* =================================================================== 
            Recupera linha primeira linha selecionada
            =================================================================== */
            var oItems = this.templateBaseExtension.getExtensionAPI().getSelectedContexts();

            /* =================================================================== 
            Verifica as linhas selecionadas
            =================================================================== */
            if (!oItems.length) {
                sap.m.MessageToast.show("Favor selecionar um registro.");
                return;
            }

    
                /* =================================================================== 
                Entra no Gateway 
                =================================================================== */
            /* =================================================================== 
                Configura Serviço OData onde será extraído os dados
                =================================================================== */
                var vServiceUrl = "/sap/opu/odata/sap/ZUI_O2_CA_PRINTERS";
                var oModel = new sap.ui.model.odata.ODataModel(vServiceUrl, false);
    
                /* =================================================================== 
                Chama Serviço
                =================================================================== */
                oModel.read("/Printer", {
    
                    success: function (oData) {
    
                        var item = oItems[0];
                        this.printForm(oData.results, item);
    
                    }.bind(this),
    
                    error: function (oError) {
                        alert('Falha ao recuperar os impressoras cadastradas no SAP');
                    }.bind(this)
                })
    
            },
    
            printForm: function (Results, Item) {
    
                var that = this;
    
                /* =================================================================== 
                Configura lista Dropdown
                =================================================================== */
                var oComboBox = new sap.m.ComboBox({
                    id: 'oComboBox',
                    items: {
                        path: '/items',
                        //Configura nome das colunas
                        template: new sap.ui.core.ListItem({
                            key: "{Printer}",
                            text: "{PrinterType}",
                            additionalText: "{PrinterType}"
                        }),
                        templateShareable: false
                    },
                    showSecondaryValues: true
                })
                // Adiciona tabela como lista
                oComboBox.setModel(new sap.ui.model.json.JSONModel({ items: Results }));
    
                /* =================================================================== 
                Configura conteúdo do Pop-up
                =================================================================== */
                var oContent = new sap.ui.layout.VerticalLayout({
                    width: '100%',
                    content: [
                        new sap.m.Text({ text: "Selecione o tipo de formulário desejado" }),
                        new sap.m.Text({ text: 'Se não selecionado nenhuma a impressora padrão do usuário é escolhida ' }),
                        oComboBox
                    ]
                });
    
                /* =================================================================== 
                Configura botão de impressão
                =================================================================== */
                var oTriggerButton = new sap.m.Button({
                    type: sap.m.ButtonType.Emphasized,
                    text: "Imprimir",
                    press: function () {
    
                        var vPrintName = sap.ui.getCore().byId('oComboBox').getSelectedKey();
    
                        if (!vPrintName) {
                            //alert("Escolher um formulário antes de prosseguir");
                            vPrintName = "LOCL";
                            alert("Impressora padrão do usuário será utilizada");
                        }

                        pressDialog.close();
                        that.imprimirEtiqueta(Item, vPrintName)
                    }
                });
    
                /* =================================================================== 
                Cria botão de cancelar
                =================================================================== */
                var oCancelButton = new sap.m.Button({
                    text: 'Cancelar',
                    type: 'Reject',
    
                    press: function () {
                        pressDialog.close();
                        pressDialog.destroy();
                        this.getView().removeAllDependents();
                    }.bind(this)
                });
    
                /* =================================================================== 
                Cria janela pop-up
                =================================================================== */
                var pressDialog = new sap.m.Dialog({
                    type: 'Message',
                    title: "Saída de impressão",
                    resizable: true,
                    draggable: true,
                    titleAlignment: sap.m.TitleAlignment.Center,
                    content: oContent,
                    beginButton: oTriggerButton,
                    endButton: oCancelButton,
                    afterClose: function () {
                        pressDialog.destroy();
                    },
                    contentWidth: "20%",
    
                });
    
                /* =================================================================== 
                Chama janela pop-up
                =================================================================== */
                pressDialog.open();
    
            },

            imprimirEtiqueta: function (Item, printer) {

            /* =================================================================== 
                Configura Serviço OData onde será extraído os dados
                =================================================================== */
                var vServiceUrl = "/sap/opu/odata/sap/ZQM_IMPRIME_ETIQUETA_SRV";
                var oModel = new sap.ui.model.odata.ODataModel(vServiceUrl, false);
                var sSource  = "/imprimirSet(Lote='" + Item.getObject().Batch + "',Centro='" + Item.getObject().Plant + "',Material='" + Item.getObject().Material + "',Printer='" + printer + "')";
                
                /* =================================================================== 
                Chama Serviço
                =================================================================== */
                oModel.read(sSource, {
    
                    success: function (oData, oResponse) {
                        var message = "Spool " + oData.Spool + "gerada com sucesso para formulário Etiqueta"
                        sap.m.MessageBox.show(message, sap.m.MessageBox.Icon.SUCCESS);
                    }.bind(this),
   
                    error: function (oError) {
                        var message = $(oError.response.body).find('message').first().text();
                        sap.m.MessageBox.show(message, sap.m.MessageBox.Icon.ERROR);
                    }.bind(this)
                })

            }
                 
        };
    });
    