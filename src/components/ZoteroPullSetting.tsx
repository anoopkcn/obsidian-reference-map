import React from 'react';
import { t } from 'src/lang/helpers';
import { DEFAULT_ZOTERO_PORT } from 'src/constants';
import { getZUserGroups } from 'src/utils';
import { SettingItem } from './SettingItem';
import ReferenceMap from 'src/main';
import { RELOAD } from 'src/types';

function validateGroups(
    plugin: ReferenceMap,
    groups: Array<{ id: number; name: string }>
) {
    // if groups is empty, we can't validate anything
    if (groups.length === 0) {
        return false;
    }
    const validated: Array<{ id: number; name: string }> = [];

    plugin.settings.zoteroGroups.forEach((g) => {
        if (groups.some((g2) => g2.id === g.id)) {
            validated.push(g);
        }
    });

    plugin.settings.zoteroGroups = validated;
    plugin.saveSettings();
    return true;
}

export function ZoteroPullSetting({ plugin }: { plugin: ReferenceMap }) {
    const [isEnabled, setIsEnabled] = React.useState(
        !!plugin.settings.pullFromZotero
    );
    const [possibleGroups, setPossibleGroups] = React.useState(
        plugin.settings.zoteroGroups
    );
    const [activeGroups, setActiveGroups] = React.useState(
        plugin.settings.zoteroGroups
    );
    const [connected, setConnected] = React.useState(false);

    const pullUserGroups = async () => {
        try {
            const groups = await getZUserGroups(
                plugin.settings.zoteroPort ?? DEFAULT_ZOTERO_PORT
            );
            const isvalid = validateGroups(plugin, groups);
            if (!isvalid) {
                return;
            } else {
                setPossibleGroups(groups);
                setConnected(true);
            }
        } catch {
            setConnected(false);
        }
    }

    React.useEffect(() => {
        pullUserGroups();
    }, []);

    return (
        <>
            <div className="setting-item orm-setting-item ">
                <SettingItem
                    name={t('ZOTERO_PULL')}
                    description={t('ZOTERO_PULL_DESC')}
                >
                    <div
                        onClick={() => {
                            setIsEnabled((cur) => {
                                plugin.settings.pullFromZotero = !cur;
                                if (connected && activeGroups.length == 0) {
                                    const myLibrary = possibleGroups.find((g) => g.id === 1);
                                    if (myLibrary) {
                                        activeGroups.push(myLibrary);
                                        plugin.settings.zoteroGroups = activeGroups;
                                        setActiveGroups([...activeGroups]);
                                    }
                                }
                                plugin.saveSettings().then(() => {
                                    plugin.referenceMapData.reinit(true)
                                    plugin.referenceMapData?.reload(RELOAD.SOFT)
                                });
                                return !cur;
                            });
                        }}
                        className={`checkbox-container${isEnabled ? ' is-enabled' : ''}`}
                    />
                </SettingItem>
            </div>
            {!connected && (
                <div className="setting-item orm-setting-item">
                    <SettingItem
                        name={t('CANNOT_CONNECT_TO_ZOTERO')}
                        description={t('CANNOT_CONNECT_TO_ZOTERO_DESC')}
                    >
                        <button onClick={pullUserGroups} className="mod-cta">
                            Retry
                        </button>
                    </SettingItem>
                </div>
            )}
            {isEnabled && connected && (
                <>
                    <div className="setting-item orm-setting-item">
                        <SettingItem
                            name={t('ZOTERO_PORT')}
                            description={t(
                                "ZOTERO_PORT_DESC"
                            )}
                        >
                            <input
                                onChange={(e) => {
                                    plugin.settings.zoteroPort = e.target.value;
                                    plugin.saveSettings();
                                    plugin.referenceMapData?.reload(RELOAD.SOFT)
                                }}
                                type="text"
                                spellCheck={false}
                                defaultValue={plugin.settings.zoteroPort ?? DEFAULT_ZOTERO_PORT}
                            />
                        </SettingItem>
                    </div>
                    <div className="setting-item orm-setting-item-wrapper">
                        <SettingItem name={t('ZOTERO_LIBRARY_ID')} />
                        {possibleGroups.map((g) => {
                            const isEnabled = activeGroups.some((g2) => g2.id === g.id);
                            return (
                                <div key={g.id} className="orm-group-toggle">
                                    <SettingItem description={g.name}>
                                        <div
                                            onClick={() => {
                                                if (isEnabled) {
                                                    const next = activeGroups.filter(
                                                        (g2) => g2.id !== g.id
                                                    );
                                                    plugin.settings.zoteroGroups = next;
                                                    setActiveGroups(next);
                                                } else {
                                                    activeGroups.push(g);
                                                    plugin.settings.zoteroGroups = activeGroups;
                                                    setActiveGroups([...activeGroups]);
                                                }
                                                plugin.saveSettings().then(() => {
                                                    plugin.referenceMapData.reinit(true)
                                                    plugin.referenceMapData?.reload(RELOAD.SOFT)
                                                });
                                            }}
                                            className={`checkbox-container${isEnabled ? ' is-enabled' : ''
                                                }`}
                                        />
                                    </SettingItem>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </>
    );
}