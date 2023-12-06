import React from 'react';

type ItemInfo = {
    name?: string;
    description?: string | React.ReactNode;
    options?: { ON: string; OFF: string }
    icon?: React.ReactNode;
}

export function SettingItemInfo({ name, description, options, icon }: ItemInfo) {
    return (
        <div className="setting-item-info">
            <div className="setting-item-name">
                {icon}{' '}
                {name}
            </div>
            <div className="setting-item-description">
                {description}
            </div>
            {options && (
                < div className="setting-item-description">
                    <b>Toggle ON: </b>{options.ON}
                    <br />
                    <b>Toggle OFF: </b>{options.OFF}
                </div>
            )
            }
        </div>
    );
}

export function SettingItem({
    name,
    description,
    icon,
    options,
    children,
}: React.PropsWithChildren<ItemInfo>) {
    return (
        <>
            <SettingItemInfo
                name={name}
                description={description}
                options={options}
                icon={icon} />
            <div className="setting-item-control">{children}</div>
        </>
    );
}