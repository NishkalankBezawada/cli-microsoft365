import assert from 'assert';
import sinon from 'sinon';
import auth from '../../../../Auth.js';
import { cli } from '../../../../cli/cli.js';
import { CommandInfo } from '../../../../cli/CommandInfo.js';
import { Logger } from '../../../../cli/Logger.js';
import { CommandError } from '../../../../Command.js';
import request from '../../../../request.js';
import { telemetry } from '../../../../telemetry.js';
import { pid } from '../../../../utils/pid.js';
import { session } from '../../../../utils/session.js';
import { sinonUtil } from '../../../../utils/sinonUtil.js';
import commands from '../../commands.js';
import command from './contenttype-get.js';
import { settingsNames } from '../../../../settingsNames.js';

describe(commands.CONTENTTYPE_GET, () => {
  const contentTypeByIdResponse = { "Description": "Create a new list item.", "DisplayFormTemplateName": "ListForm", "DisplayFormUrl": "", "DocumentTemplate": "", "DocumentTemplateUrl": "", "EditFormTemplateName": "ListForm", "EditFormUrl": "", "Group": "PnP Content Types", "Hidden": false, "Id": { "StringValue": "0x0100558D85B7216F6A489A499DB361E1AE2F" }, "JSLink": "", "MobileDisplayFormUrl": "", "MobileEditFormUrl": "", "MobileNewFormUrl": "", "Name": "PnP Alert", "NewFormTemplateName": "ListForm", "NewFormUrl": "", "ReadOnly": false, "SchemaXml": "<ContentType ID=\"0x0100558D85B7216F6A489A499DB361E1AE2F\" Name=\"PnP Alert\" Group=\"PnP Content Types\" Description=\"Create a new list item.\" Version=\"1\"><Folder TargetName=\"_cts/PnP Alert\" /><Fields><Field ID=\"{c042a256-787d-4a6f-8a8a-cf6ab767f12d}\" Name=\"ContentType\" SourceID=\"http://schemas.microsoft.com/sharepoint/v3\" StaticName=\"ContentType\" Group=\"_Hidden\" Type=\"Computed\" DisplayName=\"Content Type\" Sealed=\"TRUE\" Sortable=\"FALSE\" RenderXMLUsingPattern=\"TRUE\" PITarget=\"MicrosoftWindowsSharePointServices\" PIAttribute=\"ContentTypeID\" DelayActivateTemplateBinding=\"GROUP,SPSPERS,SITEPAGEPUBLISHING\" Customization=\"\"><FieldRefs><FieldRef ID=\"{03e45e84-1992-4d42-9116-26f756012634}\" Name=\"ContentTypeId\" /></FieldRefs><DisplayPattern><MapToContentType><Column Name=\"ContentTypeId\" /></MapToContentType></DisplayPattern></Field><Field ID=\"{fa564e0f-0c70-4ab9-b863-0177e6ddd247}\" Name=\"Title\" SourceID=\"http://schemas.microsoft.com/sharepoint/v3\" StaticName=\"Title\" Group=\"_Hidden\" Type=\"Text\" DisplayName=\"Title\" Required=\"TRUE\" FromBaseType=\"TRUE\" DelayActivateTemplateBinding=\"GROUP,SPSPERS,SITEPAGEPUBLISHING\" Customization=\"\" ShowInNewForm=\"TRUE\" ShowInEditForm=\"TRUE\"></Field></Fields><XmlDocuments><XmlDocument NamespaceURI=\"http://schemas.microsoft.com/sharepoint/v3/contenttype/forms\"><FormTemplates xmlns=\"http://schemas.microsoft.com/sharepoint/v3/contenttype/forms\"><Display>ListForm</Display><Edit>ListForm</Edit><New>ListForm</New></FormTemplates></XmlDocument></XmlDocuments></ContentType>", "Scope": "/sites/portal", "Sealed": false, "StringId": "0x0100558D85B7216F6A489A499DB361E1AE2F" };
  const contentTypeByNameResponse = { value: [{ "Description": "Create a new list item.", "DisplayFormTemplateName": "ListForm", "DisplayFormUrl": "", "DocumentTemplate": "", "DocumentTemplateUrl": "", "EditFormTemplateName": "ListForm", "EditFormUrl": "", "Group": "PnP Content Types", "Hidden": false, "Id": { "StringValue": "0x0100558D85B7216F6A489A499DB361E1AE2F" }, "JSLink": "", "MobileDisplayFormUrl": "", "MobileEditFormUrl": "", "MobileNewFormUrl": "", "Name": "PnP Alert", "NewFormTemplateName": "ListForm", "NewFormUrl": "", "ReadOnly": false, "SchemaXml": "<ContentType ID=\"0x0100558D85B7216F6A489A499DB361E1AE2F\" Name=\"PnP Alert\" Group=\"PnP Content Types\" Description=\"Create a new list item.\" Version=\"1\"><Folder TargetName=\"_cts/PnP Alert\" /><Fields><Field ID=\"{c042a256-787d-4a6f-8a8a-cf6ab767f12d}\" Name=\"ContentType\" SourceID=\"http://schemas.microsoft.com/sharepoint/v3\" StaticName=\"ContentType\" Group=\"_Hidden\" Type=\"Computed\" DisplayName=\"Content Type\" Sealed=\"TRUE\" Sortable=\"FALSE\" RenderXMLUsingPattern=\"TRUE\" PITarget=\"MicrosoftWindowsSharePointServices\" PIAttribute=\"ContentTypeID\" DelayActivateTemplateBinding=\"GROUP,SPSPERS,SITEPAGEPUBLISHING\" Customization=\"\"><FieldRefs><FieldRef ID=\"{03e45e84-1992-4d42-9116-26f756012634}\" Name=\"ContentTypeId\" /></FieldRefs><DisplayPattern><MapToContentType><Column Name=\"ContentTypeId\" /></MapToContentType></DisplayPattern></Field><Field ID=\"{fa564e0f-0c70-4ab9-b863-0177e6ddd247}\" Name=\"Title\" SourceID=\"http://schemas.microsoft.com/sharepoint/v3\" StaticName=\"Title\" Group=\"_Hidden\" Type=\"Text\" DisplayName=\"Title\" Required=\"TRUE\" FromBaseType=\"TRUE\" DelayActivateTemplateBinding=\"GROUP,SPSPERS,SITEPAGEPUBLISHING\" Customization=\"\" ShowInNewForm=\"TRUE\" ShowInEditForm=\"TRUE\"></Field></Fields><XmlDocuments><XmlDocument NamespaceURI=\"http://schemas.microsoft.com/sharepoint/v3/contenttype/forms\"><FormTemplates xmlns=\"http://schemas.microsoft.com/sharepoint/v3/contenttype/forms\"><Display>ListForm</Display><Edit>ListForm</Edit><New>ListForm</New></FormTemplates></XmlDocument></XmlDocuments></ContentType>", "Scope": "/sites/portal", "Sealed": false, "StringId": "0x0100558D85B7216F6A489A499DB361E1AE2F" }] };
  let log: string[];
  let logger: Logger;
  let loggerLogSpy: sinon.SinonSpy;
  let commandInfo: CommandInfo;

  before(() => {
    sinon.stub(auth, 'restoreAuth').resolves();
    sinon.stub(telemetry, 'trackEvent').resolves();
    sinon.stub(pid, 'getProcessName').returns('');
    sinon.stub(session, 'getId').returns('');
    auth.connection.active = true;
    commandInfo = cli.getCommandInfo(command);
  });

  beforeEach(() => {
    log = [];
    logger = {
      log: async (msg: string) => {
        log.push(msg);
      },
      logRaw: async (msg: string) => {
        log.push(msg);
      },
      logToStderr: async (msg: string) => {
        log.push(msg);
      }
    };
    loggerLogSpy = sinon.spy(logger, 'log');
  });

  afterEach(() => {
    sinonUtil.restore([
      request.get,
      cli.getSettingWithDefaultValue
    ]);
  });

  after(() => {
    sinon.restore();
    auth.connection.active = false;
  });

  it('has correct name', () => {
    assert.strictEqual(command.name, commands.CONTENTTYPE_GET);
  });

  it('has a description', () => {
    assert.notStrictEqual(command.description, null);
  });

  it('gets information about a site content type by id', async () => {
    sinon.stub(request, 'get').callsFake(async (opts) => {
      if (opts.url === `https://contoso.sharepoint.com/sites/portal/_api/web/contenttypes('0x0100558D85B7216F6A489A499DB361E1AE2F')?$expand=Parent`) {
        return contentTypeByIdResponse;
      }

      throw 'Invalid request';
    });

    await command.action(logger, { options: { webUrl: 'https://contoso.sharepoint.com/sites/portal', id: '0x0100558D85B7216F6A489A499DB361E1AE2F' } });
    assert(loggerLogSpy.calledWith(contentTypeByIdResponse));
  });

  it('gets information about a site content type by name', async () => {
    sinon.stub(request, 'get').callsFake(async (opts) => {
      if ((opts.url as string).indexOf(`/_api/web/contenttypes?$filter=Name eq 'PnP%20Alert'&$expand=Parent`) > -1) {
        return contentTypeByNameResponse;
      }

      throw 'Invalid request';
    });

    await command.action(logger, { options: { webUrl: 'https://contoso.sharepoint.com/sites/portal', name: 'PnP Alert' } });
    assert(loggerLogSpy.calledWith(contentTypeByNameResponse.value[0]));
  });

  it('gets information about a list content type by id', async () => {
    sinon.stub(request, 'get').callsFake(async (opts) => {
      if (opts.url === `https://contoso.sharepoint.com/sites/portal/_api/web/lists/getByTitle('Events')/contenttypes('0x010200973548ACFFDA0948BE80AF607C4E28F9')?$expand=Parent`) {
        return contentTypeByIdResponse;
      }

      throw 'Invalid request';
    });

    await command.action(logger, { options: { debug: true, webUrl: 'https://contoso.sharepoint.com/sites/portal', id: '0x010200973548ACFFDA0948BE80AF607C4E28F9', listTitle: 'Events' } });
    assert(loggerLogSpy.calledWith(contentTypeByIdResponse));
  });

  it('gets information about a list retrieved by its title and the content type by id', async () => {
    sinon.stub(request, 'get').callsFake(async (opts) => {
      if (opts.url === `https://contoso.sharepoint.com/sites/portal/_api/web/lists(guid'9153a1f5-22f7-49e8-a854-06bb4477c2a2')/contenttypes('0x010200973548ACFFDA0948BE80AF607C4E28F9')?$expand=Parent`) {
        return contentTypeByIdResponse;
      }

      throw 'Invalid request';
    });

    await command.action(logger, { options: { debug: true, webUrl: 'https://contoso.sharepoint.com/sites/portal', id: '0x010200973548ACFFDA0948BE80AF607C4E28F9', listId: '9153a1f5-22f7-49e8-a854-06bb4477c2a2' } });
    assert(loggerLogSpy.calledWith(contentTypeByIdResponse));
  });

  it('gets information about a list retrieved by its url and the content type by id', async () => {
    sinon.stub(request, 'get').callsFake(async (opts) => {
      if (opts.url === `https://contoso.sharepoint.com/sites/portal/_api/web/GetList('%2Fsites%2Fportal%2Fdocuments')/contenttypes('0x010200973548ACFFDA0948BE80AF607C4E28F9')?$expand=Parent`) {
        return contentTypeByIdResponse;
      }

      throw 'Invalid request';
    });

    await command.action(logger, { options: { debug: true, webUrl: 'https://contoso.sharepoint.com/sites/portal', id: '0x010200973548ACFFDA0948BE80AF607C4E28F9', listUrl: 'documents' } });
    assert(loggerLogSpy.calledWith(contentTypeByIdResponse));
  });

  it('gets information about a list retrieved by its title and the content type by name', async () => {
    sinon.stub(request, 'get').callsFake(async (opts) => {
      if (opts.url === `https://contoso.sharepoint.com/sites/portal/_api/web/lists/getByTitle('Events')/contenttypes?$filter=Name eq 'Event'&$expand=Parent`) {
        return contentTypeByNameResponse;
      }

      throw 'Invalid request';
    });

    await command.action(logger, { options: { debug: true, webUrl: 'https://contoso.sharepoint.com/sites/portal', name: 'Event', listTitle: 'Events' } });
    assert(loggerLogSpy.calledWith(contentTypeByNameResponse.value[0]));
  });

  it('gets information about a list retrieved by its id and the content type by name', async () => {
    sinon.stub(request, 'get').callsFake(async (opts) => {
      if (opts.url === `https://contoso.sharepoint.com/sites/portal/_api/web/lists(guid'9153a1f5-22f7-49e8-a854-06bb4477c2a2')/contenttypes?$filter=Name eq 'Event'&$expand=Parent`) {
        return contentTypeByNameResponse;
      }

      throw 'Invalid request';
    });

    await command.action(logger, { options: { debug: true, webUrl: 'https://contoso.sharepoint.com/sites/portal', name: 'Event', listId: '9153a1f5-22f7-49e8-a854-06bb4477c2a2' } });
    assert(loggerLogSpy.calledWith(contentTypeByNameResponse.value[0]));
  });

  it('gets information about a list retrieved by its url and the content type by name', async () => {
    sinon.stub(request, 'get').callsFake(async (opts) => {
      if (opts.url === `https://contoso.sharepoint.com/sites/portal/_api/web/GetList('%2Fsites%2Fportal%2Fdocuments')/contenttypes?$filter=Name eq 'Event'&$expand=Parent`) {
        return contentTypeByNameResponse;
      }

      throw 'Invalid request';
    });

    await command.action(logger, { options: { debug: true, webUrl: 'https://contoso.sharepoint.com/sites/portal', name: 'Event', listUrl: 'documents' } });
    assert(loggerLogSpy.calledWith(contentTypeByNameResponse.value[0]));
  });

  it('correctly escapes special characters in the content type id', async () => {
    sinon.stub(request, 'get').callsFake(async (opts) => {
      if (opts.url === `https://contoso.sharepoint.com/sites/portal/_api/web/contenttypes('0%3D0100558D85B7216F6A489A499DB361E1AE2F')?$expand=Parent`) {
        return { "odata.null": true };
      }

      throw 'Invalid request';
    });

    await assert.rejects(command.action(logger, { options: { debug: true, webUrl: 'https://contoso.sharepoint.com/sites/portal', id: '0=0100558D85B7216F6A489A499DB361E1AE2F' } } as any),
      new CommandError(`Content type with ID 0=0100558D85B7216F6A489A499DB361E1AE2F not found`));
  });

  it('correctly handles site content type not found by id', async () => {
    sinon.stub(request, 'get').callsFake(async (opts) => {
      if (opts.url === `https://contoso.sharepoint.com/sites/portal/_api/web/contenttypes('0x0100558D85B7216F6A489A499DB361E1AE2F')?$expand=Parent`) {
        return { "odata.null": true };
      }

      throw 'Invalid request';
    });

    await assert.rejects(command.action(logger, { options: { debug: true, webUrl: 'https://contoso.sharepoint.com/sites/portal', id: '0x0100558D85B7216F6A489A499DB361E1AE2F' } } as any),
      new CommandError(`Content type with ID 0x0100558D85B7216F6A489A499DB361E1AE2F not found`));
  });

  it('correctly handles site content type not found by content type name', async () => {
    sinon.stub(request, 'get').callsFake(async (opts) => {
      if (opts.url === `https://contoso.sharepoint.com/sites/portal/_api/web/contenttypes?$filter=Name eq 'PnP%20Alert'&$expand=Parent`) {
        return { "value": [] };
      }

      throw 'Invalid request';
    });

    await assert.rejects(command.action(logger, { options: { debug: true, webUrl: 'https://contoso.sharepoint.com/sites/portal', name: 'PnP Alert' } } as any),
      new CommandError(`Content type with name PnP Alert not found`));
  });

  it('correctly handles list content type not found', async () => {
    sinon.stub(request, 'get').callsFake(async (opts) => {
      if (opts.url === `https://contoso.sharepoint.com/sites/portal/_api/web/lists/getByTitle('Documents')/contenttypes('0x0100558D85B7216F6A489A499DB361E1AE2F')?$expand=Parent`) {
        return { "odata.null": true };
      }

      throw 'Invalid request';
    });

    await assert.rejects(command.action(logger, { options: { debug: true, webUrl: 'https://contoso.sharepoint.com/sites/portal', id: '0x0100558D85B7216F6A489A499DB361E1AE2F', listTitle: 'Documents' } } as any),
      new CommandError(`Content type with ID 0x0100558D85B7216F6A489A499DB361E1AE2F not found`));
  });

  it('correctly handles list not found', async () => {
    sinon.stub(request, 'get').callsFake(async (opts) => {
      if (opts.url === `https://contoso.sharepoint.com/sites/portal/_api/web/lists/getByTitle('Documents')/contenttypes('0x0100558D85B7216F6A489A499DB361E1AE2F')?$expand=Parent`) {
        throw {
          error: {
            "odata.error": {
              "code": "-1, System.ArgumentException",
              "message": {
                "lang": "en-US",
                "value": "List 'Documents' does not exist at site with URL 'https://contoso.sharepoint.com/sites/portal'."
              }
            }
          }
        };
      }

      throw 'Invalid request';
    });

    await assert.rejects(command.action(logger, { options: { debug: true, webUrl: 'https://contoso.sharepoint.com/sites/portal', id: '0x0100558D85B7216F6A489A499DB361E1AE2F', listTitle: 'Documents' } } as any),
      new CommandError("List 'Documents' does not exist at site with URL 'https://contoso.sharepoint.com/sites/portal'."));
  });

  it('configures command types', () => {
    assert.notStrictEqual(typeof command.types, 'undefined', 'command types undefined');
    assert.notStrictEqual(command.types.string, 'undefined', 'command string types undefined');
  });

  it('configures id as string option', () => {
    const types = command.types;
    ['i', 'id'].forEach(o => {
      assert.notStrictEqual((types.string as string[]).indexOf(o), -1, `option ${o} not specified as string`);
    });
  });

  it('fails validation if the specified site URL is not a valid SharePoint URL', async () => {
    const actual = await command.validate({ options: { webUrl: 'site.com', id: '0x0100558D85B7216F6A489A499DB361E1AE2F' } }, commandInfo);
    assert.notStrictEqual(actual, false);
  });

  it('fails validation if both id and name are specified', async () => {
    sinon.stub(cli, 'getSettingWithDefaultValue').callsFake((settingName, defaultValue) => {
      if (settingName === settingsNames.prompt) {
        return false;
      }

      return defaultValue;
    });

    const actual = await command.validate({ options: { webUrl: 'https://contoso.sharepoint.com/sites/sales', id: '0x0100558D85B7216F6A489A499DB361E1AE2F', name: 'titleOfContentType' } }, commandInfo);
    assert.notStrictEqual(actual, false);
  });

  it('fails validation if list id is not valid id', async () => {
    const actual = await command.validate({ options: { webUrl: 'https://contoso.sharepoint.com/sites/sales', id: '0x0100558D85B7216F6A489A499DB361E1AE2F', listId: 'foo' } }, commandInfo);
    assert.notStrictEqual(actual, false);
  });

  it('fails validation if none id or name are specified', async () => {
    sinon.stub(cli, 'getSettingWithDefaultValue').callsFake((settingName, defaultValue) => {
      if (settingName === settingsNames.prompt) {
        return false;
      }

      return defaultValue;
    });

    const actual = await command.validate({ options: { webUrl: 'https://contoso.sharepoint.com/sites/sales', id: undefined, name: undefined } }, commandInfo);
    assert.notStrictEqual(actual, false);
  });

  it('passes validation when all required parameters are valid', async () => {
    const actual = await command.validate({ options: { webUrl: 'https://contoso.sharepoint.com/sites/sales', id: '0x0100558D85B7216F6A489A499DB361E1AE2F' } }, commandInfo);
    assert.strictEqual(actual, true);
  });
});
