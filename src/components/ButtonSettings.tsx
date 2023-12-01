import React from 'react';
import ReferenceMap from 'src/main';
import { SettingItem } from './SettingItem';
import { t } from 'src/lang/helpers';
import { RELOAD } from 'src/types';
import { METADATA_COPY_TEMPLATE_ONE, METADATA_COPY_TEMPLATE_THREE, METADATA_COPY_TEMPLATE_TWO } from 'src/constants';
import { CopyIconOne, CopyIconThree, CopyIconTwo } from 'src/icons';

export function ButtonSettings({ plugin }: { plugin: ReferenceMap }) {
    const [isButtonOne, setButtonOne] = React.useState(
        !!plugin.settings.formatMetadataCopyOne
    );
    const [isButtonOneBatch, setButtonOneBatch] = React.useState(
        !!plugin.settings.metadataCopyOneBatch
    );

    const [isButtonTwo, setButtonTwo] = React.useState(
        !!plugin.settings.formatMetadataCopyTwo
    );
    const [isButtonTwoBatch, setButtonTwoBatch] = React.useState(
        !!plugin.settings.metadataCopyTwoBatch
    );

    const [isButtonThree, setButtonThree] = React.useState(
        !!plugin.settings.formatMetadataCopyThree
    );

    const [isButtonThreeBatch, setButtonThreeBatch] = React.useState(
        !!plugin.settings.metadataCopyThreeBatch
    );

    return (
        <>
            <div className="setting-item orm-setting-item ">
                <SettingItem
                    name={t('FORMAT_METADATA_COPY_ONE')}
                    description={t('FORMAT_METADATA_COPY_ONE_DESC')}
                    options={
                        {
                            ON: t('FORMAT_METADATA_COPY_ONE_ON'),
                            OFF: t('FORMAT_METADATA_COPY_ONE_OFF')
                        }
                    }
                    icon={<CopyIconOne size={15} />}
                >
                    <div
                        onClick={() => {
                            setButtonOne((cur) => {
                                plugin.settings.formatMetadataCopyOne = !cur;
                                plugin.saveSettings().then(() => {
                                    plugin.referenceMapData.reinit(true)
                                    plugin.referenceMapData?.reload(RELOAD.SOFT)
                                });
                                return !cur;
                            });
                        }}
                        className={`checkbox-container${isButtonOne ? ' is-enabled' : ''}`}
                    />
                </SettingItem>
            </div>
            {isButtonOne && (
                <>
                    <div className="setting-item orm-setting-item">
                        <SettingItem
                            name={t('METADATA_COPY_TEMPLATE_ONE')}
                            description={t(
                                "METADATA_COPY_TEMPLATE_ONE_DESC"
                            )}
                            icon={<CopyIconOne size={15} />}
                        >
                            <textarea
                                style={{ minWidth: '200px', maxWidth: '500px', minHeight: '100px' }} 
                                onChange={(e) => {
                                    plugin.settings.metadataCopyTemplateOne = e.target.value;
                                    plugin.saveSettings();
                                    plugin.referenceMapData?.reload(RELOAD.VIEW);
                                }}
                                spellCheck={false}
                                defaultValue={plugin.settings.metadataCopyTemplateOne ?? METADATA_COPY_TEMPLATE_ONE}
                            />
                        </SettingItem>
                    </div>
                    <div className="setting-item orm-setting-item ">
                        <SettingItem
                            name={t('METADATA_COPY_ONE_BATCH')}
                            description={t('METADATA_COPY_ONE_BATCH_DESC')}
                            icon={<CopyIconOne size={15} />}
                            options={
                                {
                                    ON: t('METADATA_COPY_ONE_BATCH_ON'),
                                    OFF: t('METADATA_COPY_ONE_BATCH_OFF')
                                }
                            }
                        >
                            <div
                                onClick={() => {
                                    if (isButtonOne) {
                                        setButtonOneBatch((cur) => {
                                            plugin.settings.metadataCopyOneBatch = !cur;
                                            plugin.saveSettings().then(() => {
                                                plugin.referenceMapData.reinit(true)
                                                plugin.referenceMapData?.reload(RELOAD.SOFT)
                                            });
                                            return !cur;
                                        });
                                    }
                                }}
                                className={`checkbox-container${isButtonOneBatch ? ' is-enabled' : ''}`}
                            />
                        </SettingItem>
                    </div>
                </>
            )}

            {/* TWO */}
            <div className="setting-item orm-setting-item ">
                <SettingItem
                    name={t('FORMAT_METADATA_COPY_TWO')}
                    description={t('FORMAT_METADATA_COPY_TWO_DESC')}
                    options={
                        {
                            ON: t('FORMAT_METADATA_COPY_TWO_ON'),
                            OFF: t('FORMAT_METADATA_COPY_TWO_OFF')
                        }
                    }
                    icon={<CopyIconTwo size={15} />}
                >
                    <div
                        onClick={() => {
                            setButtonTwo((cur) => {
                                plugin.settings.formatMetadataCopyTwo = !cur;
                                plugin.saveSettings().then(() => {
                                    plugin.referenceMapData.reinit(true)
                                    plugin.referenceMapData?.reload(RELOAD.SOFT)
                                });
                                return !cur;
                            });
                        }}
                        className={`checkbox-container${isButtonTwo ? ' is-enabled' : ''}`}
                    />
                </SettingItem>
            </div>
            {isButtonTwo && (
                <>
                    <div className="setting-item orm-setting-item">
                        <SettingItem
                            name={t('METADATA_COPY_TEMPLATE_TWO')}
                            description={t(
                                "METADATA_COPY_TEMPLATE_TWO_DESC"
                            )}
                            icon={<CopyIconTwo size={15} />}
                        >
                            <textarea
                                style={{ minWidth: '200px', maxWidth: '500px', minHeight: '100px' }} 
                                onChange={(e) => {
                                    plugin.settings.metadataCopyTemplateTwo = e.target.value;
                                    plugin.saveSettings();
                                    plugin.referenceMapData?.reload(RELOAD.VIEW)
                                }}
                                spellCheck={false}
                                defaultValue={plugin.settings.metadataCopyTemplateTwo ?? METADATA_COPY_TEMPLATE_TWO}
                            />
                        </SettingItem>
                    </div>
                    <div className="setting-item orm-setting-item ">
                        <SettingItem
                            name={t('METADATA_COPY_TWO_BATCH')}
                            description={t('METADATA_COPY_TWO_BATCH_DESC')}
                            icon={<CopyIconTwo size={15} />}
                            options={
                                {
                                    ON: t('METADATA_COPY_TWO_BATCH_ON'),
                                    OFF: t('METADATA_COPY_TWO_BATCH_OFF')
                                }
                            }
                        >
                            <div
                                onClick={() => {
                                    if (isButtonTwo) {
                                        setButtonTwoBatch((cur) => {
                                            plugin.settings.metadataCopyTwoBatch = !cur;
                                            plugin.saveSettings().then(() => {
                                                plugin.referenceMapData.reinit(true)
                                                plugin.referenceMapData?.reload(RELOAD.SOFT)
                                            });
                                            return !cur;
                                        });
                                    }
                                }}
                                className={`checkbox-container${isButtonTwoBatch ? ' is-enabled' : ''}`}
                            />
                        </SettingItem>
                    </div>
                </>
            )}
            {/* THREE */}
            <div className="setting-item orm-setting-item ">
                <SettingItem
                    name={t('FORMAT_METADATA_COPY_THREE')}
                    description={t('FORMAT_METADATA_COPY_THREE_DESC')}
                    options={
                        {
                            ON: t('FORMAT_METADATA_COPY_THREE_ON'),
                            OFF: t('FORMAT_METADATA_COPY_THREE_OFF')
                        }
                    }
                    icon={<CopyIconThree size={15} />}
                >
                    <div
                        onClick={() => {
                            setButtonThree((cur) => {
                                plugin.settings.formatMetadataCopyThree = !cur;
                                plugin.saveSettings().then(() => {
                                    plugin.referenceMapData.reinit(true)
                                    plugin.referenceMapData?.reload(RELOAD.SOFT)
                                });
                                return !cur;
                            });
                        }}
                        className={`checkbox-container${isButtonThree ? ' is-enabled' : ''}`}
                    />
                </SettingItem>
            </div>
            {isButtonThree && (
                <>
                    <div className="setting-item orm-setting-item">
                        <SettingItem
                            name={t('METADATA_COPY_TEMPLATE_THREE')}
                            description={t(
                                "METADATA_COPY_TEMPLATE_THREE_DESC"
                            )}
                            icon={<CopyIconThree size={15} />}
                        >
                            <textarea
                                style={{ minWidth: '200px', maxWidth: '500px', minHeight: '100px' }} 
                                onChange={(e) => {
                                    plugin.settings.metadataCopyTemplateThree = e.target.value;
                                    plugin.saveSettings();
                                    plugin.referenceMapData?.reload(RELOAD.VIEW)
                                }}
                                spellCheck={false}
                                defaultValue={plugin.settings.metadataCopyTemplateThree ?? METADATA_COPY_TEMPLATE_THREE}
                            />
                        </SettingItem>
                    </div>
                    <div className="setting-item orm-setting-item ">
                        <SettingItem
                            name={t('METADATA_COPY_THREE_BATCH')}
                            description={t('METADATA_COPY_THREE_BATCH_DESC')}
                            icon={<CopyIconThree size={15} />}
                            options={
                                {
                                    ON: t('METADATA_COPY_THREE_BATCH_ON'),
                                    OFF: t('METADATA_COPY_THREE_BATCH_OFF')
                                }
                            }
                        >
                            <div
                                onClick={() => {
                                    if (isButtonThree) {
                                        setButtonThreeBatch((cur) => {
                                            plugin.settings.metadataCopyThreeBatch = !cur;
                                            plugin.saveSettings().then(() => {
                                                plugin.referenceMapData.reinit(true)
                                                plugin.referenceMapData?.reload(RELOAD.SOFT)
                                            });
                                            return !cur;
                                        });
                                    }
                                }}
                                className={`checkbox-container${isButtonThreeBatch ? ' is-enabled' : ''}`}
                            />
                        </SettingItem>
                    </div>
                </>
            )}
        </>
    )
}