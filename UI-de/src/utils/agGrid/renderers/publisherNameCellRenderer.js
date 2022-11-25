import React from 'react';

export default function({value}) {
  const publisher = this.props.users.publishers.filter((user) => user.id === value)[0];
  return <div>
    {publisher ? `${publisher.companyName || publisher.name}` : null}
  </div>;
}
