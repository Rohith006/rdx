import React from 'react';

export default function({value}) {
  const advertiser = this.props.users.advertisers.filter((user) => user.id === value)[0];
  return <div>
    {advertiser ? `(${advertiser.id}) ${advertiser.companyName || advertiser.name}` : null}
  </div>;
}
