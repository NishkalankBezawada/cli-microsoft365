import assert from 'assert';
import sinon from 'sinon';
import auth from '../../../../Auth.js';
import { CommandError } from '../../../../Command.js';
import { cli } from '../../../../cli/cli.js';
import { CommandInfo } from '../../../../cli/CommandInfo.js';
import { Logger } from '../../../../cli/Logger.js';
import request from '../../../../request.js';
import { telemetry } from '../../../../telemetry.js';
import { pid } from '../../../../utils/pid.js';
import { session } from '../../../../utils/session.js';
import { sinonUtil } from '../../../../utils/sinonUtil.js';
import commands from '../../commands.js';
import command from './customaction-get.js';
import { settingsNames } from '../../../../settingsNames.js';

describe(commands.CUSTOMACTION_GET, () => {
  let log: string[];
  let logger: Logger;
  let loggerLogSpy: sinon.SinonSpy;
  let commandInfo: CommandInfo;
  const customactionResponseWeb = {
    "ClientSideComponentId": "015e0fcf-fe9d-4037-95af-0a4776cdfbb4",
    "ClientSideComponentProperties": "{\"testMessage\":\"Test message\"}",
    "CommandUIExtension": null,
    "Description": null,
    "Group": null,
    "Id": "d26af83a-6421-4bb3-9f5c-8174ba645c80",
    "ImageUrl": null,
    "Location": "ClientSideExtension.ApplicationCustomizer",
    "Name": "{d26af83a-6421-4bb3-9f5c-8174ba645c80}",
    "RegistrationId": null,
    "RegistrationType": 0,
    "Rights": { "High": 0, "Low": 0 },
    "Scope": "1",
    "ScriptBlock": null,
    "ScriptSrc": null,
    "Sequence": 65536,
    "Title": "Places",
    "Url": null,
    "VersionOfUserCustomAction": "1.0.1.0"
  };

  const customactionResponseSite = {
    "ClientSideComponentId": "015e0fcf-fe9d-4037-95af-0a4776cdfbb4",
    "ClientSideComponentProperties": "{\"testMessage\":\"Test message\"}",
    "CommandUIExtension": null,
    "Description": null,
    "Group": null,
    "Id": "f405303c-6048-4636-9660-1b7b2cadaef9",
    "ImageUrl": null,
    "Location": "ClientSideExtension.ApplicationCustomizer",
    "Name": "{f405303c-6048-4636-9660-1b7b2cadaef9}",
    "RegistrationId": null,
    "RegistrationType": 0,
    "Rights": { "High": 0, "Low": 0 },
    "Scope": "1",
    "ScriptBlock": null,
    "ScriptSrc": null,
    "Sequence": 65536,
    "Title": "Places",
    "Url": null,
    "VersionOfUserCustomAction": "1.0.1.0"
  };


  before(() => {
    sinon.stub(auth, 'restoreAuth').resolves();
    sinon.stub(telemetry, 'trackEvent').resolves();
    sinon.stub(pid, 'getProcessName').returns('');
    sinon.stub(session, 'getId').returns('');
    auth.connection.active = true;
    commandInfo = cli.getCommandInfo(command);
    sinon.stub(cli, 'getSettingWithDefaultValue').callsFake((settingName: string, defaultValue: any) => {
      if (settingName === 'prompt') {
        return false;
      }

      return defaultValue;
    });
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
      cli.getSettingWithDefaultValue,
      cli.handleMultipleResultsFound
    ]);
  });

  after(() => {
    sinon.restore();
    auth.connection.active = false;
  });

  it('has correct name', () => {
    assert.strictEqual(command.name, commands.CUSTOMACTION_GET);
  });

  it('has a description', () => {
    assert.notStrictEqual(command.description, null);
  });

  it('handles error when multiple user custom actions with the specified title found', async () => {
    sinon.stub(cli, 'getSettingWithDefaultValue').callsFake((settingName, defaultValue) => {
      if (settingName === settingsNames.prompt) {
        return false;
      }

      return defaultValue;
    });

    sinon.stub(request, 'get').callsFake(async (opts) => {
      if ((opts.url as string).indexOf('UserCustomActions?$filter=Title eq ') > -1) {
        return {
          value: [
            {
              ClientSideComponentId: 'b41916e7-e69d-467f-b37f-ff8ecf8f99f2',
              ClientSideComponentProperties: "'{testMessage:Test message}'",
              CommandUIExtension: null,
              Description: null,
              Group: null,
              HostProperties: '',
              Id: 'a70d8013-3b9f-4601-93a5-0e453ab9a1f3',
              ImageUrl: null,
              Location: 'ClientSideExtension.ApplicationCustomizer',
              Name: 'YourName',
              RegistrationId: null,
              RegistrationType: 0,
              Rights: [Object],
              Scope: 3,
              ScriptBlock: null,
              ScriptSrc: null,
              Sequence: 0,
              Title: 'YourAppCustomizer',
              Url: null,
              VersionOfUserCustomAction: '16.0.1.0'
            },
            {
              ClientSideComponentId: 'b41916e7-e69d-467f-b37f-ff8ecf8f99f2',
              ClientSideComponentProperties: "'{testMessage:Test message}'",
              CommandUIExtension: null,
              Description: null,
              Group: null,
              HostProperties: '',
              Id: '63aa745f-b4dd-4055-a4d7-d9032a0cfc59',
              ImageUrl: null,
              Location: 'ClientSideExtension.ApplicationCustomizer',
              Name: 'YourName',
              RegistrationId: null,
              RegistrationType: 0,
              Rights: [Object],
              Scope: 3,
              ScriptBlock: null,
              ScriptSrc: null,
              Sequence: 0,
              Title: 'YourAppCustomizer',
              Url: null,
              VersionOfUserCustomAction: '16.0.1.0'
            }
          ]
        };
      }

      throw 'Invalid request';
    });

    await assert.rejects(command.action(logger, {
      options: {
        title: 'YourAppCustomizer',
        webUrl: 'https://contoso.sharepoint.com',
        scope: 'Web'
      }
    }), new CommandError("Multiple user custom actions with title 'YourAppCustomizer' found. Found: a70d8013-3b9f-4601-93a5-0e453ab9a1f3, 63aa745f-b4dd-4055-a4d7-d9032a0cfc59."));
  });

  it('handles selecting single result when multiple custom actions sets with the specified name found and cli is set to prompt', async () => {
    sinon.stub(cli, 'handleMultipleResultsFound').resolves({
      ClientSideComponentId: '015e0fcf-fe9d-4037-95af-0a4776cdfbb4',
      ClientSideComponentProperties: '{"testMessage":"Test message"}',
      CommandUIExtension: null,
      Description: null,
      Group: null,
      Id: 'd26af83a-6421-4bb3-9f5c-8174ba645c80',
      ImageUrl: null,
      Location: 'ClientSideExtension.ApplicationCustomizer',
      Name: '{d26af83a-6421-4bb3-9f5c-8174ba645c80}',
      RegistrationId: null,
      RegistrationType: 0,
      Rights: '{"High":0,"Low":0}',
      Scope: '1',
      ScriptBlock: null,
      ScriptSrc: null,
      Sequence: 65536,
      Title: 'Places',
      Url: null,
      VersionOfUserCustomAction: '1.0.1.0'
    });

    sinon.stub(request, 'get').callsFake((opts) => {
      if (opts.url === "https://contoso.sharepoint.com/_api/Web/UserCustomActions?$filter=Title eq 'Places'") {
        return Promise.resolve({
          value: [
            {
              ClientSideComponentId: 'b41916e7-e69d-467f-b37f-ff8ecf8f99f2',
              ClientSideComponentProperties: "'{testMessage:Test message}'",
              CommandUIExtension: null,
              Description: null,
              Group: null,
              HostProperties: '',
              Id: 'a70d8013-3b9f-4601-93a5-0e453ab9a1f3',
              ImageUrl: null,
              Location: 'ClientSideExtension.ApplicationCustomizer',
              Name: 'YourName',
              RegistrationId: null,
              RegistrationType: 0,
              Rights: [Object],
              Scope: 3,
              ScriptBlock: null,
              ScriptSrc: null,
              Sequence: 0,
              Title: 'YourAppCustomizer',
              Url: null,
              VersionOfUserCustomAction: '16.0.1.0'
            },
            {
              ClientSideComponentId: 'b41916e7-e69d-467f-b37f-ff8ecf8f99f2',
              ClientSideComponentProperties: "'{testMessage:Test message}'",
              CommandUIExtension: null,
              Description: null,
              Group: null,
              HostProperties: '',
              Id: '63aa745f-b4dd-4055-a4d7-d9032a0cfc59',
              ImageUrl: null,
              Location: 'ClientSideExtension.ApplicationCustomizer',
              Name: 'YourName',
              RegistrationId: null,
              RegistrationType: 0,
              Rights: [Object],
              Scope: 3,
              ScriptBlock: null,
              ScriptSrc: null,
              Sequence: 0,
              Title: 'YourAppCustomizer',
              Url: null,
              VersionOfUserCustomAction: '16.0.1.0'
            }
          ]
        });
      }
      else if (opts.url === "https://contoso.sharepoint.com/_api/Site/UserCustomActions?$filter=Title eq 'Places'") {
        return Promise.resolve({
          value: []
        });
      }

      return Promise.reject('Invalid request');
    });

    await command.action(logger, {
      options: {
        title: 'Places',
        webUrl: 'https://contoso.sharepoint.com'
      }
    });
    assert(loggerLogSpy.calledWith({
      ClientSideComponentId: '015e0fcf-fe9d-4037-95af-0a4776cdfbb4',
      ClientSideComponentProperties: '{"testMessage":"Test message"}',
      CommandUIExtension: null,
      Description: null,
      Group: null,
      Id: 'd26af83a-6421-4bb3-9f5c-8174ba645c80',
      ImageUrl: null,
      Location: 'ClientSideExtension.ApplicationCustomizer',
      Name: '{d26af83a-6421-4bb3-9f5c-8174ba645c80}',
      RegistrationId: null,
      RegistrationType: 0,
      Rights: '"{\\"High\\":0,\\"Low\\":0}"',
      Scope: '1',
      ScriptBlock: null,
      ScriptSrc: null,
      Sequence: 65536,
      Title: 'Places',
      Url: null,
      VersionOfUserCustomAction: '1.0.1.0'
    }));
  });

  it('handles error when no user custom actions with the specified title found', async () => {
    sinon.stub(request, 'get').callsFake(async (opts) => {
      if ((opts.url as string).indexOf('/UserCustomActions?$filter=Title eq ') > -1) {
        return { value: [] };
      }

      throw 'Invalid request';
    });

    await assert.rejects(command.action(logger, {
      options: {
        title: 'YourAppCustomizer',
        webUrl: 'https://contoso.sharepoint.com'
      }
    }), new CommandError(`No user custom action with title 'YourAppCustomizer' found`));
  });

  it('handles error when no user custom actions with the specified id found', async () => {
    sinon.stub(request, 'get').callsFake(async (opts) => {
      if ((opts.url as string).indexOf(`/UserCustomActions(guid'7fb56deb-3725-4705-aa19-6f3b4468521c')`) > -1) {
        return { 'odata.null': true };
      }

      throw 'Invalid request';
    });

    await assert.rejects(command.action(logger, {
      options: {
        id: '7fb56deb-3725-4705-aa19-6f3b4468521c',
        webUrl: 'https://contoso.sharepoint.com'
      }
    }), new CommandError(`No user custom action with id '7fb56deb-3725-4705-aa19-6f3b4468521c' found`));
  });

  it('retrieves and prints all details user custom actions by id', async () => {
    sinon.stub(request, 'get').callsFake(async (opts) => {
      if ((opts.url as string).indexOf('/_api/Web/UserCustomActions') > -1) {
        return customactionResponseWeb;
      }
      throw 'Invalid request';
    });

    await command.action(logger, {
      options: {
        id: 'b2307a39-e878-458b-bc90-03bc578531d6',
        webUrl: 'https://contoso.sharepoint.com'
      }
    });
    assert(loggerLogSpy.calledWith({
      ClientSideComponentId: '015e0fcf-fe9d-4037-95af-0a4776cdfbb4',
      ClientSideComponentProperties: '{"testMessage":"Test message"}',
      CommandUIExtension: null,
      Description: null,
      Group: null,
      Id: 'd26af83a-6421-4bb3-9f5c-8174ba645c80',
      ImageUrl: null,
      Location: 'ClientSideExtension.ApplicationCustomizer',
      Name: '{d26af83a-6421-4bb3-9f5c-8174ba645c80}',
      RegistrationId: null,
      RegistrationType: 0,
      Rights: '{"High":0,"Low":0}',
      Scope: '1',
      ScriptBlock: null,
      ScriptSrc: null,
      Sequence: 65536,
      Title: 'Places',
      Url: null,
      VersionOfUserCustomAction: '1.0.1.0'
    }));
  });

  it('retrieves and prints all details user custom actions by title', async () => {
    sinon.stub(request, 'get').callsFake(async (opts) => {
      if ((opts.url as string).indexOf('Web/UserCustomActions?$filter=Title eq ') > -1) {
        return {
          value: [
            {
              "ClientSideComponentId": "015e0fcf-fe9d-4037-95af-0a4776cdfbb4",
              "ClientSideComponentProperties": "{\"testMessage\":\"Test message\"}",
              "CommandUIExtension": null,
              "Description": null,
              "Group": null,
              "Id": "d26af83a-6421-4bb3-9f5c-8174ba645c80",
              "ImageUrl": null,
              "Location": "ClientSideExtension.ApplicationCustomizer",
              "Name": "{d26af83a-6421-4bb3-9f5c-8174ba645c80}",
              "RegistrationId": null,
              "RegistrationType": 0,
              "Rights": { "High": 0, "Low": 0 },
              "Scope": "1",
              "ScriptBlock": null,
              "ScriptSrc": null,
              "Sequence": 65536,
              "Title": "Places",
              "Url": null,
              "VersionOfUserCustomAction": "1.0.1.0"
            }
          ]
        };
      }
      else if ((opts.url as string).indexOf('Site/UserCustomActions?$filter=Title eq ') > -1) {
        return { value: [] };
      }

      throw 'Invalid request';
    });

    await command.action(logger, {
      options: {
        title: 'Places',
        webUrl: 'https://contoso.sharepoint.com'
      }
    });
    assert(loggerLogSpy.calledWith({
      ClientSideComponentId: '015e0fcf-fe9d-4037-95af-0a4776cdfbb4',
      ClientSideComponentProperties: '{"testMessage":"Test message"}',
      CommandUIExtension: null,
      Description: null,
      Group: null,
      Id: 'd26af83a-6421-4bb3-9f5c-8174ba645c80',
      ImageUrl: null,
      Location: 'ClientSideExtension.ApplicationCustomizer',
      Name: '{d26af83a-6421-4bb3-9f5c-8174ba645c80}',
      RegistrationId: null,
      RegistrationType: 0,
      Rights: '{"High":0,"Low":0}',
      Scope: '1',
      ScriptBlock: null,
      ScriptSrc: null,
      Sequence: 65536,
      Title: 'Places',
      Url: null,
      VersionOfUserCustomAction: '1.0.1.0'
    }));
  });

  it('handles random API error on web custom action reject request', async () => {
    const err = 'Invalid request';
    sinon.stub(request, 'get').callsFake(async (opts) => {
      if ((opts.url as string).indexOf('/_api/Web/UserCustomActions(') > -1) {
        throw err;
      }

      throw 'Invalid request';
    });

    const actionId: string = 'b2307a39-e878-458b-bc90-03bc578531d6';

    await assert.rejects(command.action(logger, {
      options: {
        id: actionId,
        webUrl: 'https://contoso.sharepoint.com',
        scope: 'All'
      }
    }), new CommandError(err));
  });

  it('handles random API error on site custom action reject request', async () => {
    const err = 'Invalid request';
    sinon.stub(request, 'get').callsFake(async (opts) => {
      if ((opts.url as string).indexOf('/_api/Web/UserCustomActions(') > -1) {
        return { "odata.null": true };
      }

      if ((opts.url as string).indexOf('/_api/Site/UserCustomActions(') > -1) {
        throw err;
      }

      throw 'Invalid request';
    });

    const actionId: string = 'b2307a39-e878-458b-bc90-03bc578531d6';

    await assert.rejects(command.action(logger, {
      options: {
        verbose: true,
        id: actionId,
        webUrl: 'https://contoso.sharepoint.com',
        scope: 'All'
      }
    }), new CommandError(err));
  });

  it('supports specifying scope', () => {
    const options = command.options;
    let containsScopeOption = false;
    options.forEach(o => {
      if (o.option.indexOf('[scope]') > -1) {
        containsScopeOption = true;
      }
    });
    assert(containsScopeOption);
  });

  it('fails validation if the url option is not a valid SharePoint site URL', async () => {
    const actual = await command.validate({
      options:
      {
        id: "BC448D63-484F-49C5-AB8C-96B14AA68D50",
        webUrl: 'foo'
      }
    }, commandInfo);
    assert.notStrictEqual(actual, true);
  });

  it('fails validation if the id option is not a valid guid', async () => {
    const actual = await command.validate({
      options:
      {
        id: "foo",
        webUrl: 'https://contoso.sharepoint.com'
      }
    }, commandInfo);
    assert.notStrictEqual(actual, true);
  });

  it('passes validation when the id and url options specified', async () => {
    const actual = await command.validate({
      options:
      {
        id: "BC448D63-484F-49C5-AB8C-96B14AA68D50",
        webUrl: "https://contoso.sharepoint.com"
      }
    }, commandInfo);
    assert.strictEqual(actual, true);
  });

  it('passes validation when the id, url and scope options specified', async () => {
    const actual = await command.validate({
      options:
      {
        id: "BC448D63-484F-49C5-AB8C-96B14AA68D50",
        webUrl: "https://contoso.sharepoint.com",
        scope: "Site"
      }
    }, commandInfo);
    assert.strictEqual(actual, true);
  });

  it('passes validation when the id and url option specified', async () => {
    const actual = await command.validate({
      options:
      {
        id: "BC448D63-484F-49C5-AB8C-96B14AA68D50",
        webUrl: "https://contoso.sharepoint.com"
      }
    }, commandInfo);
    assert.strictEqual(actual, true);
  });

  it('humanize scope shows correct value when scope odata is 2', () => {
    const actual = (command as any)["humanizeScope"](2);
    assert(actual === "Site");
  });

  it('humanize scope shows correct value when scope odata is 3', () => {
    const actual = (command as any)["humanizeScope"](3);
    assert(actual === "Web");
  });

  it('humanize scope shows the scope odata value when is different than 2 and 3', () => {
    const actual = (command as any)["humanizeScope"](1);
    assert(actual === "1");
  });

  it('accepts scope to be All', async () => {
    const actual = await command.validate({
      options:
      {
        id: "BC448D63-484F-49C5-AB8C-96B14AA68D50",
        webUrl: "https://contoso.sharepoint.com",
        scope: 'All'
      }
    }, commandInfo);
    assert.strictEqual(actual, true);
  });

  it('accepts scope to be Site', async () => {
    const actual = await command.validate({
      options:
      {
        id: "BC448D63-484F-49C5-AB8C-96B14AA68D50",
        webUrl: "https://contoso.sharepoint.com",
        scope: 'Site'
      }
    }, commandInfo);
    assert.strictEqual(actual, true);
  });

  it('accepts scope to be Web', async () => {
    const actual = await command.validate({
      options:
      {
        id: "BC448D63-484F-49C5-AB8C-96B14AA68D50",
        webUrl: "https://contoso.sharepoint.com",
        scope: 'Web'
      }
    }, commandInfo);
    assert.strictEqual(actual, true);
  });

  it('rejects invalid string scope', async () => {
    const scope = 'foo';
    const actual = await command.validate({
      options: {
        id: "BC448D63-484F-49C5-AB8C-96B14AA68D50",
        webUrl: "https://contoso.sharepoint.com",
        scope: scope
      }
    }, commandInfo);
    assert.strictEqual(actual, `${scope} is not a valid custom action scope. Allowed values are Site|Web|All`);
  });

  it('rejects invalid scope value specified as number', async () => {
    const scope = 123;
    const actual = await command.validate({
      options: {
        id: "BC448D63-484F-49C5-AB8C-96B14AA68D50",
        webUrl: "https://contoso.sharepoint.com",
        scope: scope
      }
    }, commandInfo);
    assert.strictEqual(actual, `${scope} is not a valid custom action scope. Allowed values are Site|Web|All`);
  });

  it('doesn\'t fail validation if the optional scope option not specified', async () => {
    const actual = await command.validate(
      {
        options:
        {
          id: "BC448D63-484F-49C5-AB8C-96B14AA68D50",
          webUrl: "https://contoso.sharepoint.com"
        }
      }, commandInfo);
    assert.strictEqual(actual, true);
  });

  it('retrieves a user custom actions by clientSideComponentId', async () => {
    sinon.stub(request, 'get').callsFake(async (opts) => {
      if ((opts.url as string).indexOf('/_api/Site/UserCustomActions') > -1) {
        return { value: [customactionResponseSite] };
      }

      throw 'Invalid request';
    });

    await assert.doesNotReject(command.action(logger, {
      options: {
        clientSideComponentId: '015e0fcf-fe9d-4037-95af-0a4776cdfbb4',
        webUrl: 'https://contoso.sharepoint.com',
        scope: 'Site'
      }
    }));
  });

  it('throws error when multiple user custom actions with same clientSideComponentId were found', async () => {
    sinon.stub(cli, 'getSettingWithDefaultValue').callsFake((settingName, defaultValue) => {
      if (settingName === settingsNames.prompt) {
        return false;
      }

      return defaultValue;
    });

    sinon.stub(request, 'get').callsFake(async (opts) => {
      if ((opts.url as string).indexOf('/_api/Site/UserCustomActions') > -1) {
        return { value: [customactionResponseSite] };
      }

      if ((opts.url as string).indexOf('/_api/Web/UserCustomActions') > -1) {
        return { value: [customactionResponseWeb] };
      }

      throw 'Invalid request';
    });

    await assert.rejects(command.action(logger, {
      options: {
        clientSideComponentId: '015e0fcf-fe9d-4037-95af-0a4776cdfbb4',
        webUrl: 'https://contoso.sharepoint.com'
      }
    }), new CommandError("Multiple user custom actions with ClientSideComponentId '015e0fcf-fe9d-4037-95af-0a4776cdfbb4' found. Found: f405303c-6048-4636-9660-1b7b2cadaef9, d26af83a-6421-4bb3-9f5c-8174ba645c80."));
  });

  it('handles selecting single result when multiple custom actions sets with the specified ClientSideComponentId found and cli is set to prompt', async () => {
    sinon.stub(cli, 'handleMultipleResultsFound').resolves({
      ClientSideComponentId: '015e0fcf-fe9d-4037-95af-0a4776cdfbb4',
      ClientSideComponentProperties: '{"testMessage":"Test message"}',
      CommandUIExtension: null,
      Description: null,
      Group: null,
      Id: 'd26af83a-6421-4bb3-9f5c-8174ba645c80',
      ImageUrl: null,
      Location: 'ClientSideExtension.ApplicationCustomizer',
      Name: '{d26af83a-6421-4bb3-9f5c-8174ba645c80}',
      RegistrationId: null,
      RegistrationType: 0,
      Rights: '{"High":0,"Low":0}',
      Scope: '1',
      ScriptBlock: null,
      ScriptSrc: null,
      Sequence: 65536,
      Title: 'Places',
      Url: null,
      VersionOfUserCustomAction: '1.0.1.0'
    });

    sinon.stub(request, 'get').callsFake((opts) => {
      if (opts.url === "https://contoso.sharepoint.com/_api/Web/UserCustomActions?$filter=ClientSideComponentId eq guid'015e0fcf-fe9d-4037-95af-0a4776cdfbb4'") {
        return Promise.resolve({
          value: [
            {
              ClientSideComponentId: 'b41916e7-e69d-467f-b37f-ff8ecf8f99f2',
              ClientSideComponentProperties: "'{testMessage:Test message}'",
              CommandUIExtension: null,
              Description: null,
              Group: null,
              HostProperties: '',
              Id: 'a70d8013-3b9f-4601-93a5-0e453ab9a1f3',
              ImageUrl: null,
              Location: 'ClientSideExtension.ApplicationCustomizer',
              Name: 'YourName',
              RegistrationId: null,
              RegistrationType: 0,
              Rights: [Object],
              Scope: 3,
              ScriptBlock: null,
              ScriptSrc: null,
              Sequence: 0,
              Title: 'YourAppCustomizer',
              Url: null,
              VersionOfUserCustomAction: '16.0.1.0'
            },
            {
              ClientSideComponentId: 'b41916e7-e69d-467f-b37f-ff8ecf8f99f2',
              ClientSideComponentProperties: "'{testMessage:Test message}'",
              CommandUIExtension: null,
              Description: null,
              Group: null,
              HostProperties: '',
              Id: '63aa745f-b4dd-4055-a4d7-d9032a0cfc59',
              ImageUrl: null,
              Location: 'ClientSideExtension.ApplicationCustomizer',
              Name: 'YourName',
              RegistrationId: null,
              RegistrationType: 0,
              Rights: [Object],
              Scope: 3,
              ScriptBlock: null,
              ScriptSrc: null,
              Sequence: 0,
              Title: 'YourAppCustomizer',
              Url: null,
              VersionOfUserCustomAction: '16.0.1.0'
            }
          ]
        });
      }
      else if (opts.url === "https://contoso.sharepoint.com/_api/Site/UserCustomActions?$filter=ClientSideComponentId eq guid'015e0fcf-fe9d-4037-95af-0a4776cdfbb4'") {
        return Promise.resolve({
          value: []
        });
      }

      return Promise.reject('Invalid request');
    });

    await command.action(logger, {
      options: {
        clientSideComponentId: '015e0fcf-fe9d-4037-95af-0a4776cdfbb4',
        webUrl: 'https://contoso.sharepoint.com'
      }
    });
    assert(loggerLogSpy.calledWith({
      ClientSideComponentId: '015e0fcf-fe9d-4037-95af-0a4776cdfbb4',
      ClientSideComponentProperties: '{"testMessage":"Test message"}',
      CommandUIExtension: null,
      Description: null,
      Group: null,
      Id: 'd26af83a-6421-4bb3-9f5c-8174ba645c80',
      ImageUrl: null,
      Location: 'ClientSideExtension.ApplicationCustomizer',
      Name: '{d26af83a-6421-4bb3-9f5c-8174ba645c80}',
      RegistrationId: null,
      RegistrationType: 0,
      Rights: '"{\\"High\\":0,\\"Low\\":0}"',
      Scope: '1',
      ScriptBlock: null,
      ScriptSrc: null,
      Sequence: 65536,
      Title: 'Places',
      Url: null,
      VersionOfUserCustomAction: '1.0.1.0'
    }));
  });

  it('throws error when no user custom actions were found based on clientSideComponentId', async () => {
    sinon.stub(request, 'get').callsFake(async (opts) => {
      if ((opts.url as string).indexOf('/_api/Site/UserCustomActions') > -1) {
        return { value: [] };
      }

      throw 'Invalid request';
    });

    await assert.rejects(command.action(logger, {
      options: {
        clientSideComponentId: '4358e70e-ec3c-4713-beb6-39c88f7621d1',
        webUrl: 'https://contoso.sharepoint.com',
        scope: 'Site'
      }
    }), new CommandError(`No user custom action with ClientSideComponentId '4358e70e-ec3c-4713-beb6-39c88f7621d1' found`));
  });

  it('fails validation if the clientSideComponentId option is not a valid guid', async () => {
    const actual = await command.validate({
      options:
      {
        clientSideComponentId: "foo",
        webUrl: 'https://contoso.sharepoint.com'
      }
    }, commandInfo);
    assert.notStrictEqual(actual, true);
  });
});